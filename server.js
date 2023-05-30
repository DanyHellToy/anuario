const express = require('express');
const mysql = require('mysql');
const path = require('path');
const multer = require('multer');
const ejs = require('ejs');
const moment = require('moment');
const bodyParser = require('body-parser');

const app = express();
//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public',express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const con = mysql.createConnection({
  host: 'localhost',
  user: 'dnava',
  password: '@12b12@',
  database: 'dbanuario1',
});

con.connect((err) => {
  if (err) {
    console.error('Error de conexión: ' + err.stack);
    return;
  }
  console.log('¡Conectado a la base de datos MySQL!');
});

const storage = multer.diskStorage({
  destination: './public/images',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg') {
      cb(null, true);
    } else {
      cb(new Error('El archivo debe ser de tipo JPG.'));
    }
  }
}).single('foto');

app.post('/login', (req, res) => {
  const { nombre_usuario, contraseña } = req.body;

  const sqlSelect = 'SELECT tipo_usuario FROM usuarios WHERE nombre_usuario = ? AND contraseña = ?';
  con.query(sqlSelect, [nombre_usuario, contraseña], (err, result) => {
    if (err) {
      console.error('Error al realizar la consulta: ' + err.message);
      return res.status(500).send('Error al iniciar sesión.');
    }

    if (result.length === 0) {
      // No se encontró el usuario
      return res.status(404).send('Usuario no encontrado.');
    }

    const tipo_usuario = result[0].tipo_usuario;

    if (tipo_usuario === 'alumno') {
      // Redirigir a la página de alumnos
      res.redirect('/views/alumnos');
    } else if (tipo_usuario === 'profesor' || tipo_usuario === 'administrador') {
      // Redirigir a la página de administrador
      res.redirect('/views/admin');
    } else {
      // Tipo de usuario inválido
      res.status(400).send('Tipo de usuario inválido.');
    }
  });
});

app.post('/altp', (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Error al subir la imagen: ' + err.message);
      return res.status(400).send('Error al subir la imagen.');
    } else if (err) {
      console.error('Error: ' + err.message);
      return res.status(400).send(err.message);
    }

    const {
      nombre_usuario,
      correo_electronico,
      descripcion
    } = req.body;

    const fecha_registro = moment().format('YYYY-MM-DD');
    const tipo_usuario = 'profesor';
    const contraseña = req.body.contraseña || '123';
    const contrasena = req.body.contrasena || '123';
    const fecha_nacimiento = req.body.fecha_nacimiento || '0000-00-00';
    const foto = req.file.filename;
    const especialidad = req.body.especialidad;

    const sqlInsertUsuario =
      'INSERT INTO usuarios (nombre_usuario, contraseña, fecha_nacimiento, fecha_registro, foto, correo_electronico, tipo_usuario, descripcion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const sqlInsertProfesor =
      'INSERT INTO profesores (id_usuario, nombre_completo, contraseña, fecha_nacimiento, fecha_registro, especialidad) VALUES (?, ?, ?, ?, ?, ?)';

    con.query(
      sqlInsertUsuario,
      [nombre_usuario, contraseña, fecha_nacimiento, fecha_registro, foto, correo_electronico, tipo_usuario, descripcion || null],
      (err, result) => {
        if (err) {
          console.error('Error al insertar en la tabla usuarios: ' + err.message);
          return res.status(500).send('Error al registrar el profesor.');
        }

        const id_usuario = result.insertId;

        con.query(
          sqlInsertProfesor,
          [id_usuario, nombre_usuario, contrasena, fecha_nacimiento, fecha_registro, especialidad],
          (err) => {
            if (err) {
              console.error('Error al insertar en la tabla profesor: ' + err.message);
              return res.status(500).send('Error al registrar el profesor.');
            }

            console.log('Profesor registrado con éxito.');

            // Redirigir a la página de inicio de sesión
            res.redirect('/views/admin');
          }
        );
      }
    );
  });
});

app.post('/alta', (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Error al subir la imagen: ' + err.message);
      return res.status(400).send('Error al subir la imagen.');
    } else if (err) {
      console.error('Error: ' + err.message);
      return res.status(400).send(err.message);
    }

    const {
      nombre_usuario,
      correo_electronico,
      descripcion
    } = req.body;

    const fecha_registro = moment().format('YYYY-MM-DD');
    const tipo_usuario = 'alumno';
    const contraseña = req.body.contraseña || '123';
    const fecha_nacimiento = req.body.fecha_nacimiento || '0000-00-00';
    const foto = req.file ? req.file.filename : 'sinfoto.jpg'; // Asignar 'sinfoto.jpg' si no se subió ninguna foto
      
    const carrera = req.body.carrera; // Nueva línea para obtener la carrera del formulario

    const sqlInsertUsuario =
      'INSERT INTO usuarios (nombre_usuario, contraseña, correo_electronico, fecha_nacimiento, fecha_registro, foto, tipo_usuario, descripcion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

    const sqlInsertAlumno =
      'INSERT INTO alumnos (id_usuario, nombre_completo, foto, carrera, fecha_nacimiento, correo_electronico, fecha_registro, contraseña, descripcion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

    con.query(
      sqlInsertUsuario,
      [nombre_usuario, contraseña, correo_electronico, fecha_nacimiento, fecha_registro, foto, tipo_usuario, descripcion],
      (err, result) => {
        if (err) {
          console.error('Error al insertar en la tabla usuarios: ' + err.message);
          return res.status(500).send('Error al registrar el alumno.');
        }

        const id_usuario = result.insertId;

        con.query(
          sqlInsertAlumno,
          [id_usuario, nombre_usuario, foto, carrera, fecha_nacimiento, correo_electronico, fecha_registro, contraseña, descripcion],
          (err) => {
            if (err) {
              console.error('Error al insertar en la tabla alumnos: ' + err.message);
              return res.status(500).send('Error al registrar el alumno.');
            }
            console.log('Alumno registrado con éxito.');
            // Redirigir a la página de inicio de sesión
            res.redirect('/views/admin');
          }
        );
      }
    );
  });
});

app.post('/eliminarusuario', (req, res) => {
  const id_usuario = req.body.id_usuario;

  // Verificar si existen referencias al usuario en la tabla 'alumnos'
  const sqlCheckReferences = 'SELECT * FROM alumnos WHERE id_usuario = ?';
  con.query(sqlCheckReferences, [id_usuario], (err, result) => {
    if (err) {
      console.error('Error al verificar las referencias del usuario:', err);
      return res.status(500).send('Error al eliminar el usuario.');
    }

    if (result.length > 0) {
      // Si existen referencias, eliminar los registros asociados en la tabla 'alumnos'
      const sqlDeleteAlumnos = 'DELETE FROM alumnos WHERE id_usuario = ?';
      con.query(sqlDeleteAlumnos, [id_usuario], (err, result) => {
        if (err) {
          console.error('Error al eliminar los registros de alumnos:', err);
          return res.status(500).send('Error al eliminar el usuario.');
        }

        // Después de eliminar los registros en 'alumnos', proceder con la eliminación del usuario en 'usuarios'
        const sqlDeleteUser = 'DELETE FROM usuarios WHERE id_usuario = ?';
        con.query(sqlDeleteUser, [id_usuario], (err, result) => {
          if (err) {
            console.error('Error al eliminar el usuario:', err);
            return res.status(500).send('Error al eliminar el usuario.');
          }

          console.log('Usuario eliminado con éxito.');

          // Redirigir a la página de inicio de sesión o a otra página de tu elección
          res.redirect('/views/admin');
        });
      });
    } else {
      // Si no hay referencias en 'alumnos', eliminar directamente el usuario en 'usuarios'
      const sqlDeleteUser = 'DELETE FROM usuarios WHERE id_usuario = ?';
      con.query(sqlDeleteUser, [id_usuario], (err, result) => {
        if (err) {
          console.error('Error al eliminar el usuario:', err);
          return res.status(500).send('Error al eliminar el usuario.');
        }

        console.log('Usuario eliminado con éxito.');

        // Redirigir a la página de inicio de sesión o a otra página de tu elección
        res.redirect('/views/admin');
      });
    }
  });
});

app.post('/editaruser', (req, res) => {
  const id_usuario = req.body.id_usuario;
  const {
    tipo_usuario,
    nombre_usuario,
    correo_electronico,
  } = req.body;
 
  const sql = 'UPDATE usuarios SET tipo_usuario = ?, nombre_usuario = ?, correo_electronico = ? WHERE id_usuario = ?';
  const values = [tipo_usuario, nombre_usuario, correo_electronico, id_usuario];

  con.query(sql,values, (err, result) => {
    if (err) {
      console.error('Error al actualizar el usuario:', err);
      return res.status(500).send('Error al actualizar usuario.');
    }
    //res.send('Registro actualizado');
    res.redirect('/views/admin');
  });
});

// Ruta para procesar el formulario de registro de proyectos
app.post('/agregarproyecto', (req, res) => {
  const {
    id_alumno,
    nombre_proyecto,
    descripcion_proyecto,
    foto_proyecto,
  } = req.body;

  // Insertar el proyecto en la tabla 'proyectos'
  const sqlInsertProyecto = 'INSERT INTO proyectos (id_alumno, nombre_proyecto, descripcion_proyecto, foto_proyecto) VALUES (?, ?, ?, ?)';

  con.query(
    sqlInsertProyecto,
    [id_alumno, nombre_proyecto, descripcion_proyecto, foto_proyecto],
    (err, result) => {
      if (err) {
        console.error('Error al agregar el proyecto:', err);
        return res.status(500).send('Error al crear el proyecto.');
      }
      console.log('Proyecto creado con éxito.');
      res.redirect('/views/admin');
    }
  );
});

// RUTAS
app.get('/', (req, res) => {
  res.render('login');
});

app.get('/registroa', (req, res) => {
  res.render('registroa');
});

app.get('/registrom', (req, res) => {
  res.render('registrom');
});

// Ruta para mostrar los proyectos
app.get('/proyectos', (req, res) => {
  // Realizar la consulta a la base de datos para obtener los proyectos
  const sql = 'SELECT * FROM proyectos';
  con.query(sql, (err, result) => {
    if (err) {
      console.error('Error al obtener los proyectos:', err);
      return res.status(500).send('Error al obtener los proyectos.');
    }

    // Renderizar la vista proyectos.ejs y pasar los proyectos obtenidos como variable
    res.json({ usuarios: result });
  });
});

// Ruta para obtener los usuarios
app.get('/getUsuarios', (req, res) => {
  const sql = 'SELECT * FROM usuarios';
  con.query(sql, (err, result) => {
    if (err) {
      console.error('Error al obtener los usuarios:', err);
      return res.status(500).send('Error al obtener los usuarios.');
    }

    res.json({ usuarios: result });
  });
});

// Ruta para obtener los datos de la tabla de alumnos
app.get('/getAlumnos', (req, res) => {
  const sqlSelect = 'SELECT * FROM alumnos';
  con.query(sqlSelect, (err, result) => {
    if (err) {
      console.error('Error al obtener los alumnos:', err);
      return res.status(500).send('Error al obtener los alumnos.');
    }

    res.json({ alumnos: result });
  });
});

// Ruta para obtener los datos de la tabla de profesores
app.get('/getProfesores', (req, res) => {
  const sqlSelect = 'SELECT * FROM profesores';
  con.query(sqlSelect, (err, result) => {
    if (err) {
      console.error('Error al obtener los profesores:', err);
      return res.status(500).send('Error al obtener los profesores.');
    }

    res.json({ profesores: result });
  });
});

async function obtenerDatosProyectos() {
  // Realiza la consulta a la base de datos para obtener los proyectos
  const sqlSelectProyectos = 'SELECT * FROM proyectos';
  return new Promise((resolve, reject) => {
    con.query(sqlSelectProyectos, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}


app.get('/proyectos', async (req, res) => {
  try {
    const proyectos = await obtenerDatosProyectos();
    res.render('proyectos', { proyectos: proyectos });
  } catch (error) {
    console.error('Error al obtener los proyectos:', error);
    res.status(500).send('Error al obtener los proyectos.');
  }
});

function obtenerDatosProyectos() {
  return new Promise((resolve, reject) => {
    const sqlSelect = 'SELECT * FROM proyectos';
    con.query(sqlSelect, (err, result) => {
      if (err) {
        console.error('Error al obtener los proyectos:', err);
        reject(err);
      }
      
      resolve(result);
    });
  });
}

app.get('/alumnos', async function(req, res) {
  try {
    const alumnos = await obtenerDatosAlumnos();
    res.render('alumnos', { alumnos: alumnos });
  } catch (error) {
    console.error('Error al obtener los alumnos:', error);
    res.status(500).send('Error al obtener los alumnos.');
  }
});

function obtenerDatosAlumnos() {
  return new Promise((resolve, reject) => {
    const sqlSelect = 'SELECT * FROM alumnos';
    con.query(sqlSelect, (err, result) => {
      if (err) {
        console.error('Error al obtener los alumnos:', err);
        reject(err);
      }
      
      resolve(result);
    });
  });
}

// Ruta para renderizar la vista de alumnos y pasar los datos
app.get('/views/alumnos', async function(req, res) {
  try {
    const datosAlumnos = await obtenerDatosAlumnos();
    res.render('alumnos', { alumnos: datosAlumnos });
  } catch (error) {
    console.error('Error al obtener los alumnos:', error);
    res.status(500).send('Error al obtener los alumnos.');
  }
});

app.get('/views/proyectos', async (req, res) => {
  try {
    const proyectos = await obtenerDatosProyectos();
    res.render('proyectos', { proyectos: proyectos }); // Asegúrate de que proyectos esté definido y tenga contenido
  } catch (error) {
    console.error('Error al obtener los proyectos:', error);
    res.status(500).send('Error al obtener los proyectos.');
  }
});


app.get('/views/admin', (req, res) => {
  res.render('admin');
});

app.get('/views/login', (req, res) => {
  res.render('login');
});

app.get('/views/talumnos', (req, res) => {
  res.render('talumnos');
});

app.get('/views/tprofesores', (req, res) => {
  res.render('tprofesores');
});

app.get('/views/addprofesores', (req, res) => {
  res.render('addprofesores');
});

app.get('/views/addalumnos', (req, res) => {
  res.render('addalumnos');
});

app.get('/views/editaruser', (req, res) => {
  res.render('editaruser');
});

app.get('/views/eliminar', (req, res) => {
  res.render('eliminar');
});

app.get('/views/cproyecto', (req, res) => {
  res.render('cproyecto');
});

app.get('/views/proyectos', (req, res) => {
  res.render('proyectos');
});

app.listen(5000, () => {
  console.log('🌵 Escuchando el puerto 5000 🌵');
});