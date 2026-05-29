import { Mail } from "lucide-react";

import { LoginForm } from "@/components/login-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Badge variant="secondary" className="mb-2 w-fit">
            ProjeCalculo
          </Badge>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Mail className="size-5 text-primary" aria-hidden="true" />
            Acessar workspace
          </CardTitle>
          <CardDescription>
            Entre com link magico para manter seu historico de produtividade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
