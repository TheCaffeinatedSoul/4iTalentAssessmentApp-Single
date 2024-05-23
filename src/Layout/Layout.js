import { Outlet } from "react-router-dom";
import { NavbarComponent } from "../components/NavbarComponent/NavbarComponent";
import './Layout.css';

export const Layout = () => {
    return(
        <>
        <NavbarComponent/>
        <div className="main-body-div">
            <main className="main-body">
                <Outlet/>
            </main>
        </div>
        </>
    )
}