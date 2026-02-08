import { redirect } from "next/navigation";

export default function HomeRootRedirect() {
    redirect('/home/movies');
}
