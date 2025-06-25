import { useState } from "react";
import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Bot, KeyRound, Sparkles, Zap, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const loginSchema = insertUserSchema.pick({ email: true, password: true });
const registerSchema = insertUserSchema.pick({ email: true, password: true }).extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Redirect if already logged in - use useEffect to avoid state updates during render
  React.useEffect(() => {
    if (user && !isAnonymous) {
      setLocation("/");
    }
  }, [user, isAnonymous, setLocation]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLogin = async (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        setLocation("/");
      },
    });
  };

  const onRegister = async (values: z.infer<typeof registerSchema>) => {
    registerMutation.mutate({
      email: values.email,
      password: values.password,
    }, {
      onSuccess: () => {
        setLocation("/");
      },
    });
  };

  const handleAnonymousAccess = () => {
    setIsAnonymous(true);
    localStorage.setItem("isAnonymous", "true");
    localStorage.setItem("anonymousSessionId", `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    setLocation("/");
    toast({
      title: "Guest Mode Activated",
      description: "You're now using Ashteams AI as a guest. Your chats won't be saved.",
    });
  };

  return (
    <div className="min-h-screen bg-github-dark text-github-text flex">
      {/* Left Column - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Logo and Title */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-github-blue rounded-xl mb-4">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-github-text mb-2">Ashteams AI</h1>
            <p className="text-github-muted">Advanced AI Assistant for Smart Conversations</p>
          </div>

          {/* Auth Tabs */}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-github-surface">
              <TabsTrigger value="login" className="data-[state=active]:bg-github-blue">Sign In</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-github-blue">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="bg-github-surface border-github-border">
                <CardHeader>
                  <CardTitle className="text-github-text">Welcome back</CardTitle>
                  <CardDescription className="text-github-muted">
                    Sign in to your account to continue your conversations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-github-text">Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-github-dark border-github-border text-github-text focus:border-github-blue"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-github-text">Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter your password"
                                className="bg-github-dark border-github-border text-github-text focus:border-github-blue"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full bg-github-blue hover:bg-blue-600 text-white"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="bg-github-surface border-github-border">
                <CardHeader>
                  <CardTitle className="text-github-text">Create account</CardTitle>
                  <CardDescription className="text-github-muted">
                    Join Ashteams AI to save your conversations and access advanced features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-github-text">Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-github-dark border-github-border text-github-text focus:border-github-blue"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-github-text">Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Create a password"
                                className="bg-github-dark border-github-border text-github-text focus:border-github-blue"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-github-text">Confirm Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Confirm your password"
                                className="bg-github-dark border-github-border text-github-text focus:border-github-blue"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full bg-github-blue hover:bg-blue-600 text-white"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Anonymous Access */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={handleAnonymousAccess}
              className="text-github-muted hover:text-github-text hover:bg-github-surface"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              Continue as Guest (Limited Features)
            </Button>
          </div>
        </div>
      </div>

      {/* Right Column - Hero Section */}
      <div className="flex-1 bg-github-surface border-l border-github-border p-8 flex items-center justify-center">
        <div className="max-w-lg text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-github-blue/10 rounded-2xl mb-6">
            <Bot className="w-10 h-10 text-github-blue" />
          </div>
          
          <h2 className="text-3xl font-bold text-github-text mb-4">
            Intelligent AI Assistant
          </h2>
          
          <p className="text-lg text-github-muted mb-8">
            Experience advanced AI capabilities for coding, problem-solving, and complex reasoning tasks with intelligent conversation.
          </p>

          <div className="space-y-4">
            <div className="flex items-center text-left space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-github-blue/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-github-blue" />
              </div>
              <div>
                <h3 className="font-medium text-github-text">Advanced Reasoning</h3>
                <p className="text-sm text-github-muted">Multi-step logical thinking and problem decomposition</p>
              </div>
            </div>

            <div className="flex items-center text-left space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-github-blue/10 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-github-blue" />
              </div>
              <div>
                <h3 className="font-medium text-github-text">Fast & Efficient</h3>
                <p className="text-sm text-github-muted">Optimized for quick responses and lower computational costs</p>
              </div>
            </div>

            <div className="flex items-center text-left space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-github-blue/10 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-github-blue" />
              </div>
              <div>
                <h3 className="font-medium text-github-text">Secure & Private</h3>
                <p className="text-sm text-github-muted">Your conversations are protected and never used for training</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
