import { AiFillSignal } from "react-icons/ai";
import { AiOutlineDoubleRight } from "react-icons/ai";
import "./App.css";
import { useEffect, useState } from "react";
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { CircularProgress, Divider } from "@mui/joy";
import Tutorial from "./tutorial/Tutorial";
import Header from "./header/Header";
import Analyses from "./analyses/Analyses";

function App() {
  const [asset, setAsset] = useState("");
  const [price, setPrice] = useState("");
  const [traning, setTraining] = useState("");
  const [test, setTest] = useState("");
  const [pred, setPred] = useState("");
  const [realPred, setRealPred] = useState("");
  const [isLoadingPred, setIsLoadingPred] = useState(false);

  const [rmse, setRmse] = useState("");
  const [realPredDate, setRealPredDate] = useState("");

  const analyzeAsset = async () => {
    try {
      setIsLoadingPred(true);
      await axios
        .get(`http://127.0.0.1:8000/analyze-asset`, {
          params: { input_string: asset },
        })
        .then((response) => {
          const trainingData = JSON.parse(response.data.training);
          const testData = JSON.parse(response.data.test);
          const predictions = JSON.parse(response.data.pred);
          const realPrediction = JSON.parse(response.data.realPred);
          const rmseResult = JSON.parse(response.data.rmse);
          setRmse(rmseResult);
          setTraining(trainingData);
          setTest(testData);
          setPred(predictions);
          setRealPred(parseFloat(realPrediction));
        })
        .catch((e) => {
          console.log(e);
        });
    } catch (e) {
    } finally {
      setIsLoadingPred(false);
    }
  };

  const getDates = () => {
    const datesFromTrainingData = Object.keys(traning);
    const datesFromTestData = Object.keys(test);
    const allDates = datesFromTrainingData.concat(datesFromTestData);

    allDates.sort((a, b) => new Date(a) - new Date(b));
    if (allDates.length > 0) {
      const lastDate = allDates[allDates.length - 1];

      const dateObj = new Date(lastDate);
      dateObj.setDate(dateObj.getDate() + 1);
      const newDate = Date.parse(dateObj);
      allDates.push(newDate);
    }

    return allDates;
  };

  useEffect(() => {
    const lastDate = getDates() != null ? getDates().at(-1) : "";
    setRealPredDate(lastDate);
  }, [traning]);

  function simulateInvestment(predictions, realValues, initialInvestment) {
    let stocksInPortfolio = 0;
    let currentAmount = parseFloat(initialInvestment);
    let totalProfit = 0;

    const dates = Object.keys(predictions);
    const profitPerDay = {};

    for (let i = 0; i < dates.length; i++) {
      const currentDate = dates[i];
      const nextDate = dates[i + 1];
      const predictedPrice = predictions[nextDate];
      const realPrice = realValues[currentDate];
      if (predictedPrice > realPrice) {
        if (currentAmount > 0 && currentAmount > realPrice) {
          const purchasedStocks = Math.floor(currentAmount / realPrice);
          stocksInPortfolio += purchasedStocks;
          currentAmount -= purchasedStocks * realPrice;
        }
      } else if (predictedPrice < realPrice) {
        if (stocksInPortfolio > 0 && currentAmount > 0) {
          const saleValue = stocksInPortfolio * realPrice;
          currentAmount += saleValue;
          stocksInPortfolio = 0;
          totalProfit += saleValue - initialInvestment;
        }
      }

      profitPerDay[currentDate] = totalProfit;
    }

    currentAmount += stocksInPortfolio * realValues[dates[dates.length - 1]];

    return totalProfit;
  }

  const options = {
    title: {
      text: asset.toUpperCase(),
    },
    xAxis: {
      type: "datetime",
      labels: {
        format: "{value:%Y-%m-%d}", // Formato da data no eixo X
      },
      categories: getDates(),
    },
    plotOptions: {
      series: {
        label: {
          connectorAllowed: false,
        },
        pointStart: getDates()[0],
      },
    },
    yAxis: {
      title: {
        text: "Cotações", // Defina o novo título do eixo Y aqui
      },
      // ... outras configurações do eixo Y
    },
    chart: {
      zoomType: "x", // Habilita o zoom horizontal
    },

    series: [
      {
        name: "Treinamento",
        data: Object.entries(traning).map(([date, value]) => [
          Date.parse(date),
          value,
        ]),
      },
      {
        name: "Teste",
        data: Object.entries(test).map(([date, value]) => [
          Date.parse(date),
          value,
        ]),
      },
      {
        name: "Predição",
        data: Object.entries(pred).map(([date, value]) => [
          Date.parse(date),
          value,
        ]),
      },
      {
        name: "Cotação Predita",
        data: [[realPredDate, realPred]],
      },
    ],

    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            legend: {
              layout: "horizontal",
              align: "center",
              verticalAlign: "bottom",
            },
          },
        },
      ],
    },
  };

  const assetSession = () => {
    if (traning === "" && isLoadingPred) {
      return (
        <div className="home-card-results">
          <CircularProgress variant="soft" />
          <p>Analisando o ativo...</p>
        </div>
      );
    } else if (traning === "" && isLoadingPred === false) {
      return (
        <div className="home-card-results">
          <AiFillSignal size={40} color="#002F42" />
          <p>Escolha um ativo para nossa IA avaliar</p>
        </div>
      );
    } else {
      return (
        <div className="home-card-results">
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
      );
    }
  };

  return (
    <div className="container">
      <Header />
      <Tutorial />

      <div className="home">
        <div className="home-card-questions">
          <h1>Analisar ativo</h1>

          <div className="input-session">
            <p>Digite o código da ação</p>
            <input
              type="text"
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
            />
          </div>
          <div className="input-session">
            <p>Digite o valor a ser investido</p>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <button
            onClick={(e) => {
              analyzeAsset();
            }}
          >
            Analisar <AiOutlineDoubleRight />
          </button>
          {!traning == "" ? (
            <div>
              {" "}
              <p> {"RMSE: " + parseFloat(rmse).toFixed(3)}</p>
              <p>
                {"Lucro previsto na simulação: R$" +
                  simulateInvestment(pred, test, price).toFixed(2)}
              </p>
            </div>
          ) : (
            <div> </div>
          )}
        </div>
        {assetSession()}
      </div>
      {!traning == "" ? (
        <Analyses realPred={realPred} price={price} test={test} />
      ) : (
        <div> </div>
      )}
      <main className="results"></main>
    </div>
  );
}

export default App;
