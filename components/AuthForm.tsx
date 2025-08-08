"use client"

import React from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import FormField from "./FormField";
import { useRouter } from "next/navigation"
import { auth } from "@/firebase/client";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { signUp,signIn} from "@/lib/actions/auth.action";




const authFormSchema=(type:FormType)=>{
  return z.object({
   name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
  email: z.string().email(),
   password:z.string().min(6),
})
}

const AuthForm = ({type}:{type:FormType}) => {
  const router = useRouter();
    // 1. Define your form.
    const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })
 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
 try {
  if (type === "sign-up") {
    const {name,email,password}=values;
    const UserCredentials = await createUserWithEmailAndPassword(auth, email, password);
    const result=await signUp({
      uid: UserCredentials.user.uid,
      name:name!,
      email,
      password
    })
    if(!result?.success){
      toast.error(result?.message || "Failed to create user");
      return;
    }

   toast.success("Sign In Successful");
   router.push("/sign-in");

  }
  else{
    const {email,password}=values;
    const UserCredentials = await signInWithEmailAndPassword(auth, email, password);

    const idToken=await UserCredentials.user.getIdToken();
    if(!idToken){
      toast.error("Failed to get user token");
      return;
    }
    await signIn({
       email,idToken
    })

    toast.success("Sign In Successful");
    router.push("/");
  }
 } catch (error) {
  console.log(error);
  toast.error(`Error is ${error}.`);
 }
  }


  const isSignIn= type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px]">
        <div className="flex flex-col gap-6 card py-14 px-10">
            <div className="flex flex-row gap-2 justify-center">
                <Image src="/logo.svg" alt="logo" height={32} width={38} />
                <h2 className="text-primary-100">PrepWise</h2>
            </div>
             <h3>Practice Job Interview with AI</h3>

      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className=" w-full space-y-6 mt-4 form">
        {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="name"
                placeholder="Your Name"
                type="text"
              />
            )}

            <FormField
                control={form.control}
                name="email"
                label="Email"
                placeholder="Your email"
                type="email"
              />
              
         <FormField
                control={form.control}
                name="password"
                label="Password"
                placeholder="Your Password"
                type="password"
              />

        <Button type="submit" className="btn">{isSignIn?'Sign-In':'Create an Account'}</Button>
      </form>
    </Form>
    <p className="text-centre">
      {isSignIn ? "Don't have an account?" : "Already have an account?"}
      <Link href={isSignIn ? "/sign-up" : "/sign-in"} className="font-bold text-user-primary ml-1">{!isSignIn?"Sign-In":"Sign up"}</Link>
    </p>
    </div>
     </div>
  )
}

export default AuthForm
