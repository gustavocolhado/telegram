import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebaseConnection";

export function DashboardHeader() {

    async function handleLogout() {
        await signOut(auth);
    }

    return(
        <div className="w-full items-center flex h-10 bg-red-500 text-white font-medium gap-4 px-4 rounded-lg mb-4">
            <Link to="/dashboard">
                Dashboard
            </Link>
            <Link to="/dashboard/new">
                Cadastrar Grupo
            </Link>

            <button className="ml-auto" onClick={handleLogout}>
                Sair da Conta
            </button>
        </div>
    )
}