// SEGURIDAD: Si no se encuentra en localStorage info del usuario
// no lo deja acceder a la página, redirigiendo al login inmediatamente.

//const { json } = require("react-router-dom");

if(!localStorage.jwt) {
  console.log('jkt -> False');
  location.replace("./index.html");

}

/* ------ comienzan las funcionalidades una vez que carga el documento ------ */
window.addEventListener('load', function () {

  /* ---------------- variables globales y llamado a funciones ---------------- */
  const url = "https://todo-api.ctd.academy/v1";
  const urlTareas = `${url}/tasks`;
  const urlUsuario = `${url}/users/getMe`;
  const token = JSON.parse(localStorage.jwt);
  const btnCerrarSesion = document.querySelector("#closeApp");
  const formCrearTarea = document.querySelector(".nueva-tarea");
  const nuevaTarea = document.querySelector("#nuevaTarea");

  obtenerNombreUsuario();
  consultarTareas();


  /* -------------------------------------------------------------------------- */
  /*                          FUNCIÓN 1 - Cerrar sesión                         */
  /* -------------------------------------------------------------------------- */

  btnCerrarSesion.addEventListener('click', function () {
    const cerrarSesion = confirm("¿Desea cerrar sesión?");

    console.warn(cerrarSesion);

    if(cerrarSesion){
      localStorage.clear();
      location.replace("./index.html")
    }


  });

  /* -------------------------------------------------------------------------- */
  /*                 FUNCIÓN 2 - Obtener nombre de usuario [GET]                */
  /* -------------------------------------------------------------------------- */

  function obtenerNombreUsuario() {
   
    const setting = {
      method: "GET",
      headers: {
        authorization: token
      }
    }

    console.log("Consulto mi usuario a la api ...")

    fetch(urlUsuario, setting)
      .then( response => {
        if (response.ok) return response.json()
      })
    .then( data => {
      console.log(data.firstName);
      const nombreUsuario = document.querySelector(".user-info p")
      nombreUsuario.textContent = data.firstName;
    })
    .catch(  err => console.log(err))


  };


  /* -------------------------------------------------------------------------- */
  /*                 FUNCIÓN 3 - Obtener listado de tareas [GET]                */
  /* -------------------------------------------------------------------------- */

  function consultarTareas() {
    const settings = {
      method: "GET",
      headers: {
        authorization: token
      }
    }
    
    console.log("Consultando tareas")
    fetch(urlTareas, settings)
      .then(response => response.json())
      .then(tareas => {
        console.log("Tareas del usuario");
        console.log(tareas);

        renderizarTareas(tareas);
        botonesCambioEstado();
        botonBorrarTarea();
      })
      .catch(err => console.log(err))


  };


  /* -------------------------------------------------------------------------- */
  /*                    FUNCIÓN 4 - Crear nueva tarea [POST]                    */
  /* -------------------------------------------------------------------------- */

  formCrearTarea.addEventListener('submit', function (e) {
    e.preventDefault();
    console.log("Crear tarea");
    console.log(nuevaTarea.value);

    const payload = {
      description: nuevaTarea.value.trim()
    }

    const settings = {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        authorization: token
      }
    }

    console.log("Creo una nueva tarea en la DB")
    fetch(urlTareas, settings)
      .then( response => response.json())
      .then( tarea => {
        console.log(tarea);
        consultarTareas();
      })
      .catch( err => console.log(err));

      //Limpiar el formulario
      formCrearTarea.reset();



  });


  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 5 - Renderizar tareas en pantalla                 */
  /* -------------------------------------------------------------------------- */
  function renderizarTareas(tareas) {

    // Obtengo listados y limpio cualquier contenido interno
    const tareasPendientes = document.querySelector(".tareas-pendientes");
    const tareasTerminadas = document.querySelector(".tareas-terminadas");

    tareasPendientes.innerHTML = "";
    tareasTerminadas.innerHTML = "";

    // Buscamos el número de finalizadas

    const numeroFinalizadas = document.querySelector("#cantidad-finalizadas");

    let contador = 0;
    //numeroFinalizadas.textContent = contador;

    tareas.forEach(tarea =>{
      //Variable intermedia para manipular la fecha
      let fecha = new Date(tarea.createdAt)

      if (tarea.completed){
        contador ++

        // lo mandamos al listado de tareas completas
        tareasTerminadas.innerHTML += `
        <li class="tarea">
          <div class="hecha">
            <i class="fa-regular fa-circle-check"></i>
          </div>
          <div class="descripcion">
            <p class="nombre"> ${tarea.description} </p>
            <div class="cambios-estados">
              <button class="change incompleta" id="${tarea.id}"><i class="fa-solid fa-rotate-left"></i></button>
              <button class="borrar" id="${tarea.id}"><i class="fa-regular fa-trash-can"></i></button>
            </div>
          </div>
        </li>
        `
      } else {
        // lo mandamos al listado de tareas sin terminar
      tareasPendientes.innerHTML += `
      <li class="tarea">
        <button class="change" id="${tarea.id}"><i class="fa-regular fa-circle"></i></button>
        <div class="descripcion">
          <p class="nombre">${tarea.description}</p>
          <p class="timestamp">${fecha.toLocaleDateString()}</p>
        </div>
      </li>
      `
      }
      
      //falta algo
      //console.log("Contador")
      //console.log(contador)
      numeroFinalizadas.textContent = contador;
    })



  };

  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 6 - Cambiar estado de tarea [PUT]                 */
  /* -------------------------------------------------------------------------- */
  function botonesCambioEstado() {
    const btnCambioEstado = document.querySelectorAll(".change");
    btnCambioEstado.forEach(boton => {
      // a cada botón le asignamos una funcionalidad
      boton.addEventListener("click", (e)=>{
        console.log("Cambiando estado de la tarea...");
        console.log(e);
        console.log(e.target.id);

        const id = e.target.id;
        const url = `${urlTareas}/${id}`;
        const payload = {

        }

        // Según el tipo de botón que fue clickeado, cambiamos el estado de la tarea
        if(e.target.classList.contains("incompleta")){
          //si está completa, la paso a pendiente
          payload.completed = false;

        } else {
          // si está incompleta, la paso a completa
          payload.completed = true;
        }

        const settingCambio = {
          method: "PUT", 
          headers: {
            "authorization": token,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }

        fetch(url, settingCambio)
          .then( response => {
            console.log(response.status);
            // Vuelvo a consultar las tareas actualizadas y pintarlas nuevamente en pantalla
            consultarTareas();
          })

      })
    })
    



  }


  /* -------------------------------------------------------------------------- */
  /*                     FUNCIÓN 7 - Eliminar tarea [DELETE]                    */
  /* -------------------------------------------------------------------------- */
  function botonBorrarTarea() {
   
    const btnBorrarTarea = document.querySelectorAll(".borrar");
    console.log(btnBorrarTarea);

    btnBorrarTarea.forEach(boton =>{

      boton.addEventListener("click", (e) =>{
        console.log("Eliminando tarea....")
        console.log(e);
        console.log(e.target.id);
  
        const idBorrar = e.target.id;
        const urlBorrar = `${urlTareas}/${idBorrar}`;
        
        const settingBorrar = {
          method: "DELETE",
          headers: {
            authorization: token
          }
        }
        fetch(urlBorrar, settingBorrar)
          .then( response => {
            console.log(response.status);

            consultarTareas()
            
          })
      })
    })
    

    

  };

});