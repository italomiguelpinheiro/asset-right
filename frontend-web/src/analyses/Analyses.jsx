import { Divider } from "@mui/joy";
import { AiFillCaretDown, AiFillCaretUp } from "react-icons/ai";
import "./Analyses.css"

function Analyses({realPred, price, test}){

    const calculateProfit = () => {
        const currentQuote = Object.values(test).at(-1);
        const predQuote = parseFloat(realPred);
        if (predQuote - currentQuote > 0) {
          return (
            <div className="analyse-session">
              <div>
                <h1>Indicação</h1>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "row",
                    color: "green",
                  }}
                >
                  <p> Compra</p>
                  <AiFillCaretUp />
                </div>
              </div>
              <Divider sx={{ margin: "10px" }} />
              <div>
                <h1> Lucro na Venda</h1>
                <p>{(price * (predQuote - currentQuote)).toFixed(3)}</p>
              </div>
            </div>
          );
        } else {
          return (
            <div sx={{ display: "flex", justifyContent: "center" }}>
              <h1>Indicação</h1>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "row",
                  color: "red",
                }}
              >
                <p> Venda</p>
                <AiFillCaretDown />
              </div>
            </div>
          );
        }
      };


    return  <div>
    <h1 className="analyses">Analises</h1>
    <div className="indication-area">
      <div className="analyse-session">
        <div>
          <h1>Cotação Atual</h1>
          <p>{Object.values(test).at(-1).toFixed(3)}</p>
        </div>
        <Divider sx={{ margin: "10px" }} />
        <div className="predict">
          <h1>Predição Para Amanhã</h1>
          <p>{realPred}</p>
        </div>
      </div>

      {calculateProfit()}
    </div>
  </div>


}

export default Analyses;