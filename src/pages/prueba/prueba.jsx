import "./pruebas.css"


const prueba = () => {



function show(){
    var inputValue = parseInt(document.getElementById("number1").value)
    var inputValue2 = parseInt(document.getElementById("number2").value)
    if(inputValue == 1){
        alert(`Texto ingresado: ${inputValue + inputValue2}`)
    }
    
}

return(
    <div className="cuerpoPrueba">
        <h1>Pagina de prueba</h1>
        <h2>Subtitulo</h2>
        <p>Escriba algo aqui abajo</p>
        <input type="number" id="number1"/>
        <input type="number" name="number2" id="number2" />
        <input type="password" />
        <button onClick={show}>mostrar texto</button>
    </div>
);
};

export default prueba