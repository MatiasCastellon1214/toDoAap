window.addEventListener("load", function () {
  /* ---------------------- obtenemos variables globales ---------------------- */
  const form = document.forms[0];
  const name = document.querySelector("#inputNombre");
  const lastName = document.querySelector("#inputApellido");
  const email = document.querySelector("#inputEmail");
  const password = document.querySelector("#inputPassword");
  const repeatPassword = document.querySelector("#inputPasswordRepetida");
  const url = "https://todo-api.ctd.academy/v1"
  //console.log(form);

  /* -------------------------------------------------------------------------- */
  /*            FUNCIÓN 1: Escuchamos el submit y preparamos el envío           */
  /* -------------------------------------------------------------------------- */
  form.addEventListener("submit", function (event) {
    
    event.preventDefault();

    const nombreValido = validarTexto(name.value);
    const apellidoValido = validarTexto(lastName.value);

    if(compararContrasenias(password.value, repeatPassword.value)){
      if(!nombreValido || !apellidoValido){
        alert("Formato de nombre y/o apellido incorrecto");
      } else if (!(validarEmail(email.value))) {
        alert("Ingrese una dirección de correo válida");
      } else if(!(validarContrasenia(password.value))){
        alert(`La contraseña debe tener: 8 caracteres como mínimo; al menos una mayúscula, una minúscula, un número entero y un caracter especial`)
      } else {
        const payload = {
          firstName: normalizarTexto(name.value),
          lastName: normalizarTexto(lastName.value),
          email: normalizarEmail(email.value),
          password: password.value,
          //repeatPassword: repeatPassword.value
          
        }
  
        console.log(payload)
  
        const setting = {
          method: "POST",
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json'
          }
        }
  
        realizarRegister(setting);
        form.reset();
        
      }
        
    } else {
      alert("Las contraseñas no coinciden");
    }  
    

  });

  /* -------------------------------------------------------------------------- */
  /*                    FUNCIÓN 2: Realizar el signup [POST]                    */
  /* -------------------------------------------------------------------------- */
  function realizarRegister(settings) {

    console.log("Lanzar la consulta a la API...");

    fetch(`${url}/users`, settings)

      .then(response =>{
        console.log(response)
        if(response.ok) return response.json();
      })

      .then(data=>{
        console.log("Promesa cumplida💍");
        console.log(data);
        console.log(data.jwt)

        if(data.jwt){
          localStorage.setItem("jwt", JSON.stringify(data.jwt));

          location.replace('./mis-tareas.html');
        }
      })

      .catch(err=>{
        console.warn("Promesa rechazada")
        console.log(err);

        if(err.status == 400){

          console.warn("El usuario ya se encuentra registrado / Alguno de los datos requeridos está incompleto");
          alert("El usuario ya se encuentra registrado / Alguno de los datos requeridos está incompleto");

        } else if (err.status == 500){

          console.warn("Error del servidor");
          alert("Error del servidor");

        }
      })

  }
});
