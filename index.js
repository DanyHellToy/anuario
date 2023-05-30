const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'dnava',
    password: '@12b12@',
    database: 'dbanuario'
});

//INICIO DE SESIÓN
router.get('/sesion', function(req, res, next) {
  conexion.query('SELECT * FROM tblalumnos', function (error, rows, fields) {
    if (error) {
      console.log(error);
      res.render('sesion', { rows: null });
    } else {
      res.render('sesion', { rows: rows });
    }
  });
  conexion.query('SELECT * FROM tblprofesores', function (error, rows, fields) {
    if (error) {
      console.log(error);
      res.render('sesion', { rows: null });
    } else {
      res.render('sesion', { rows: rows });
    }
  });
  });

//REGISTRO alumnos
router.get('/registro', function(req, res, next) {
    conexion.query('SELECT * FROM tblalumnos', function (error, rows, fields) {
        if (error) {
          console.log(error);
          res.render('registro', { rows: null });
        } else {
          res.render('registro', { rows: rows });
        }
      });
  });

  //REGISTRO maestros
router.get('/registro', function(req, res, next) {
  conexion.query('SELECT * FROM tblalumnos', function (error, rows, fields) {
      if (error) {
        console.log(error);
        res.render('registro', { rows: null });
      } else {
        res.render('registro', { rows: rows });
      }
    });
});


//PÁGINA PRINCIPAL ALUMNOS
router.get('/inicioalumnos', function(req, res, next) {
    res.render('inicioalumnos');
  });

//PERFIL ALUMNOS
router.get('/perfil', function(req, res, next) {
    res.render('perfil');
  });

//SECCION PROYECTOS
//alumnos
router.get('/proyectos', function(req, res, next) {
  conexion.query('SELECT * FROM tblproyectos', function (error, rows, fields) {
    if (error) {
      console.log(error);
      res.render('proyectos', { rows: null });
    } else {
      res.render('proyectos', { rows: rows });
    }
  });
  });
  //profes
  router.get('/proyectosprofes', function(req, res, next) {
    conexion.query('SELECT * FROM tblproyectos', function (error, rows, fields) {
    if (error) {
      console.log(error);
      res.render('proyectosprofes', { rows: null });
    } else {
      res.render('proyectosprofes', { rows: rows });
    }
  });
  });

//REGISTRAR PROYECTO
router.get('/agregarproyecto', function(req, res, next) {
  conexion.query('SELECT * FROM tblproyectos', function (error, rows, fields) {
    if (error) {
      console.log(error);
      res.render('agregarproyecto', { rows: null });
    } else {
      res.render('agregarproyecto', { rows: rows });
    }
  });
});

//BÚSQUEDA
router.post('/buscaralumnos', function(req, res, next) {
  const nombre = req.body.nombre;

  const query = `SELECT * FROM tblalumnos WHERE nombre LIKE '%${nombre}%'`;
  conexion.query(query, function(error, rows, fields) {
    if (error) {
      console.log(error);
      res.render('error', { message: 'Error al buscar alumnos', error: error });
    } else {
      res.render('resultados', { rows: rows });
    }
  });
})
router.post('/buscaralumnosp', function(req, res, next) {
  const nombre = req.body.nombre;

  const query = `SELECT * FROM tblalumnos WHERE nombre LIKE '%${nombre}%'`;
  conexion.query(query, function(error, rows, fields) {
    if (error) {
      console.log(error);
      res.render('error', { message: 'Error al buscar alumnos', error: error });
    } else {
      res.render('resultadosprofes', { rows: rows });
    }
  });
})
router.post('/buscarproyecto', function(req, res, next) {
  const textoBusqueda = req.body.textoBusqueda;
  const query = `SELECT * FROM tblproyectos WHERE nombre LIKE '%${textoBusqueda}%' OR propietario LIKE '%${textoBusqueda}%'`;
  conexion.query(query, function(error, rows, fields) {
    if (error) {
      console.log(error);
      res.render('error', { message: 'Error al buscar proyectos', error: error });
    } else {
      res.render('proyectos', { rows: rows });
    }
  });
});
router.post('/buscarproyectop', function(req, res, next) {
  const textoBusqueda = req.body.textoBusqueda;
  const query = `SELECT * FROM tblproyectos WHERE nombre LIKE '%${textoBusqueda}%' OR propietario LIKE '%${textoBusqueda}%'`;
  conexion.query(query, function(error, rows, fields) {
    if (error) {
      console.log(error);
      res.render('error', { message: 'Error al buscar proyectos', error: error });
    } else {
      res.render('proyectosprofes', { rows: rows });
    }
  });
});

//alumnos
router.get('/resultados', function(req, res, next) {
    res.render('resultados');
  });
  //profes
router.get('/resultados', function(req, res, next) {
  res.render('resultadosprofes');
});
  

//PÁGINA PRINCIPAL PROFESORES
router.get('/inicioprofes', function(req, res, next) {
    res.render('inicioprofes');
  });

//ADMINISTRACIÓN DE ALUMNOS
router.get('/usuarios', function(req, res, next) {
  conexion.query('SELECT * FROM tblalumnos', function (error, rows, fields) {
      if (error) {
        console.log(error);
        res.render('usuarios', { rows: null });
      } else {
        res.render('usuarios', { rows: rows });
      }
    });
});

  module.exports = router;