"use server"

import { use } from "react";
import { success } from "zod";
import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

export  async function signUp(params:SignUpParams){

     const{uid,name,email}=params;
     try {
        const userRecord=await db.collection('users').doc(uid).get();
   
        if(userRecord.exists){
         return {
            success:false,
            message: 'User already exists'
         }
        }

        await db.collection('users').doc(uid).set({name,email});
        return{
             success: true,
             message: 'User created successfully',
        }

     } catch (e) {
        console.log('Error creating a user',e);

      //   if(e.code === 'auth/email-already-in-use') {
      //    return {
      //       success: false,
      //       error: 'Email already in use'
      //    }
      //   }
     }
     return {
        success: false,
        message: 'Failed to create user',
     }
}

export async function setSessionCookie(idToken: string) {
   const cookieStore=await cookies();

   const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: 60 * 60 * 24 * 5 * 1000 });
   cookieStore.set("session",sessionCookie,{
      maxAge: 60 * 60 * 24 * 5, // 5 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
   })
}

export async function signIn(params:SignInParams){
   const {email,idToken} = params;
   try {
      const userRecord=await auth.getUserByEmail(email);
      if(!userRecord){
         return{
            success: false,
            message: 'User does not exist.Create an account first'
         }
      }
      await setSessionCookie(idToken);

      
   } catch (error) {
      console.error(error);
      return{
         success: false,
         message: 'Failed to sign in',
      }
   }

}


export async function getCurrentUser(): Promise<User|null>{
   const cookieStore=await cookies();
   const sessionCookie=cookieStore.get("session")?.value;
   if(!sessionCookie){
      return null;
   }
   try {
      const decodedClaims=await auth.verifySessionCookie(sessionCookie, true);
      const userRecord=await db.collection('users').doc(decodedClaims.uid).get();
      if(!userRecord.exists){
         return null;
      }
      return {
         ...userRecord.data(),
         id: decodedClaims.uid,
      } as User;
      
   } catch (error) {
      console.error("Error getting current user",error);
      return null;
   }
}


export async function isAuthenticated(){
   const user=await getCurrentUser();
   return !!user;
}



// export async function getInterviewsByUserId(userId:string):Promise<Interview[]|null>{
//    const interviews= await db.collection('interviews').where('userId','==',userId).orderBy('createdAt','desc').get();

//    return interviews.docs.map((doc)=>({
//       id:doc.id,
//       ...doc.data,
//    })) as Interview[];
// }

// export async function getLatestInterviews(params:GetLatestInterviewsParams):Promise<Interview[]|null>{
//    const {userId,limit=20}=params;
//    const interviews= await db.collection('interviews').where('finalized','==',true).where('userId','!=',userId).limit(limit).orderBy('createdAt','desc').get();

//    return interviews.docs.map((doc)=>({
//       id:doc.id,
//       ...doc.data,
//    })) as Interview[];
// }