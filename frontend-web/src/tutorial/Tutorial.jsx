import "./Tutorial.css"

function Tutorial(){

    return <div>
         <div className="explanation">
        <h1>Como funciona nossa aplicação?</h1>
        <p>
          Com apenas três passos, nossa inteligência artificial irá te informar
          se o ativo escolhido é bom ou não para ser investido
        </p>

        <div className="card-session">
          <div className="card">
            <div className="number">1</div>
            <h1>Digite o Código do ativo e o Valor a ser investido</h1>
            <p>
              Nessa fase, é importante que você tenha em mãos o código
              equivalente a o ativo desejado
            </p>
          </div>
          <div className="card">
            <div className="number">2</div>
            <h1>Deixe nossa I.A trabalhar por você</h1>
            <p>
              Nossa I.A irá buscar alguns indicadores importantes sobre esse
              ativo e processar os dados
            </p>
          </div>
          <div className="card">
            <div className="number">3</div>
            <h1>Análise feita. Hora de investir!</h1>
            <p>
              Com analise feita, nossa aplicação irá te informa o momento de
              comprar e vender o ativo, além de calcular quanto você irá lucrar
              seguindo nosso conselho.
            </p>
          </div>
        </div>
      </div>
    </div>
}

export default Tutorial;