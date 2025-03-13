import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { insertUserSchema } from "@shared/schema";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
        <div className="absolute inset-0 flex items-center justify-center -z-10">
          <div className="w-[800px] h-[800px] bg-primary/20 rounded-full blur-3xl" />
        </div>
        <Card className="w-full max-w-md border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Welcome
            </CardTitle>
            <CardDescription className="text-center text-gray-300">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/10">
                <TabsTrigger 
                  value="login"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="register"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Register
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <TabsContent value="login">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))}>
                        <div className="space-y-4">
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-200">Username</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="text" 
                                    placeholder="Enter username" 
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400
                                    focus:border-primary focus:ring-primary transition-colors"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-200">Password</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="password" 
                                    placeholder="Enter password" 
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400
                                    focus:border-primary focus:ring-primary transition-colors"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="submit" 
                            className="w-full bg-primary hover:bg-primary/90 text-white
                            transition-colors duration-200"
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign In
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </TabsContent>

                  <TabsContent value="register">
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))}>
                        <div className="space-y-4">
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-200">Username</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="text" 
                                    placeholder="Choose username" 
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400
                                    focus:border-primary focus:ring-primary transition-colors"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-200">Password</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="password" 
                                    placeholder="Choose password" 
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400
                                    focus:border-primary focus:ring-primary transition-colors"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="submit" 
                            className="w-full bg-primary hover:bg-primary/90 text-white
                            transition-colors duration-200"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Account
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary via-primary/80 to-primary/60 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05]" />
        <div className="max-w-lg text-white relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="space-y-6"
          >
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Welcome to our Platform
            </h1>
            <p className="text-xl opacity-90 leading-relaxed">
              Your secure gateway to a world of possibilities. Join us today and experience
              seamless authentication with cutting-edge security.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
