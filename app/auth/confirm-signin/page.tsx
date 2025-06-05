"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { confirmSignIn } from 'aws-amplify/auth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const confirmSchema = z.object({
  code: z.string().min(6, "Code must be 6 characters"),
});

type ConfirmForm = z.infer<typeof confirmSchema>;

export default function ConfirmSignIn() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ConfirmForm>({
    resolver: zodResolver(confirmSchema),
  });

  const onSubmit = async (data: ConfirmForm) => {
    try {
      const { isSignedIn } = await confirmSignIn({
        challengeResponse: data.code,
      });

      if (isSignedIn) {
        router.replace("/dashboard");
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Invalid verification code"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center text-foreground">
            Enter Verification Code
          </h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter the code sent to your email"
                {...register("code")}
                className={errors.code ? "border-destructive" : ""}
              />
              {errors.code && (
                <p className="text-sm text-destructive">{errors.code.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Verify Code"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 