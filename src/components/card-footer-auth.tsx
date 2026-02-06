import { Link } from "react-router";
import { Button } from "./ui/button"
import { CardFooter } from "./ui/card"


interface Props {
  type: "login" | "register";
  loading: boolean;
}

const CardFooterAuth = ({ type }: Props) => {

  const isLogin = type === "login";

  return (
    <CardFooter className="flex flex-col items-center gap-4">

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? "¿No tienes una cuenta? " : "¿Ya tienes una cuenta? "}
           <Link to={isLogin ? "/auth/register" : "/auth/login"}>
            <Button
              variant="link"
              className="p-0 h-auto font-normal"
            >
              {isLogin ? "Regístrate" : "Inicia sesión"}
            </Button>
          </Link>
        </p>

      </CardFooter>
  )
}
export default CardFooterAuth