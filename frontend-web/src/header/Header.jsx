import { AiOutlineDoubleRight } from "react-icons/ai";
import icone from "./icone.svg";
import "./Header.css";

function Header(){
    return <div>
        <div className="header-img">
        <img src={icone} className="icon" />
        <div className="header">
          <h1>
            Compre e venda no momento certo com nossa Inteligência Artificial
          </h1>
          <p>
            Deixe nossa I.A trabalhar por você e fazer toda análise técnica dos
            ativos do seu interesse.
          </p>
          <button>
            Analisar Ativo
            <AiOutlineDoubleRight />
          </button>
        </div>
      </div>
    </div>
}
export default Header;