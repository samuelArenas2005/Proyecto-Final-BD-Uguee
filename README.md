# Proyecto-Final-BD-Uguee

Este archivo contiene una explicación basica de las dependencias necesarias para la aplicación, ademas de una corta explicación de la organización de esta.

Dependencias a instalar:

--Node.js

--Npm 

--fortawesome/react-fontawesome y fortawesome/free-brands-svg-icons webfontloader

--react-google-maps/api

--react-qr-code

***EXPLICACIÓN CODIGO***

La organización del proyecto se divide en diferentes carpetas, las más importantes siendo:


-Public: Contiene recursos para la parte grafica de la aplicación como imagenes, formas, iconos, etc.

-.env:Contiene las credenciales de conexión a la base de datos (en nuestro caso Supabase).
	
-package.json:Contiene los ajustes de la aplicación con vite.
	
-mobile:Contiene los recursos para la aplicación móvil.
	
-src: la carpeta más importante del proyecto, esta contiene toda la lógica de la aplicación, además de la organización de esta, como las diferentes rutas que sigue
	la aplicación y como se comporta esta dependiendo de la ruta, desde funcionalidades, layouts, etc.
	
	
		



**INICIAR APLICACIÓN**

(Asegurarse de haber usado los comandos:
    --npm install
    --npm install @fortawesome/react-fontawesome @fortawesome/free-brands-svg-icons webfontloader
    --npm install @react-google-maps/api
    --npm install react-qr-code
)


Para iniciar la aplicación debes usar el siguiente comando en la consola:

--npm run dev

Si la ejecución es correcto apareceran diferentes opciones:

	--Dirección local
	--Dirección de Red

Puede clickear cualquieras de los dos links para iniciar la aplicación y esta funcionará de forma adecuada.
