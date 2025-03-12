// Migración de la base de datos
export const migrarBaseDatos = async (db) => {
    const VersionBaseDatos = 1;
    let { user_version: versionActual } = await db.getFirstAsync('PRAGMA user_version');
    
    if (versionActual >= VersionBaseDatos) {
        return;
    }

    if (versionActual == 0) {
        await db.execAsync(`
            PRAGMA journal_mode = "wal"; 
            
            CREATE TABLE IF NOT EXISTS usuarios(
                id INTEGER PRIMARY KEY NOT NULL, 
                nombre TEXT NOT NULL, 
                correo TEXT NOT NULL,
                telefono TEXT
            );
            
            CREATE TABLE IF NOT EXISTS dispositivos(
                id INTEGER PRIMARY KEY NOT NULL, 
                nombre TEXT NOT NULL, 
                modelo TEXT,
                numero_serie TEXT,
                estado TEXT,
                usuario_id INTEGER,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
            );
        `);
        versionActual = 1;
    }

    await db.execAsync(`PRAGMA user_version = ${VersionBaseDatos}`);
}

// Funciones para Usuarios
export const agregarUsuario = async (db, nombre, correo, telefono = '') => {
    try {
        if (nombre.trim() !== '' && correo.trim() !== '') {
            const result = await db.runAsync(
                'INSERT INTO usuarios (nombre, correo, telefono) VALUES (?, ?, ?)',
                [nombre, correo, telefono]
            );
            return result.lastInsertRowId; 
        }
    } catch (error) {
        console.error('Error al agregar usuario:', error);
        throw error;
    }
};

export const actualizarUsuario = async (db, id, nombre, correo, telefono = '') => {
    try {
        await db.runAsync(
            'UPDATE usuarios SET nombre = ?, correo = ?, telefono = ? WHERE id = ?',
            [nombre, correo, telefono, id]
        );
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        throw error;
    }
};

export const eliminarUsuario = async (db, id) => {
    try {
        await db.runAsync('DELETE FROM usuarios WHERE id = ?', [id]);
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        throw error;
    }
};

export const obtenerUsuarios = async (db) => {
    try {
        return await db.getAllAsync('SELECT * FROM usuarios ORDER BY nombre');
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        throw error;
    }
};

export const obtenerUsuario = async (db, id) => {
    try {
        return await db.getFirstAsync('SELECT * FROM usuarios WHERE id = ?', [id]);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        throw error;
    }
};

// Funciones para Dispositivos
export const agregarDispositivo = async (db, nombre, modelo, numero_serie, estado, usuario_id) => {
    try {
        if (nombre.trim() !== '') {
            const result = await db.runAsync(
                'INSERT INTO dispositivos (nombre, modelo, numero_serie, estado, usuario_id) VALUES (?, ?, ?, ?, ?)',
                [nombre, modelo, numero_serie, estado, usuario_id]
            );
            return result.lastInsertRowId; 
        }
    } catch (error) {
        console.error('Error al agregar dispositivo:', error);
        throw error;
    }
};

export const actualizarDispositivo = async (db, id, nombre, modelo, numero_serie, estado, usuario_id) => {
    try {
        await db.runAsync(
            'UPDATE dispositivos SET nombre = ?, modelo = ?, numero_serie = ?, estado = ?, usuario_id = ? WHERE id = ?',
            [nombre, modelo, numero_serie, estado, usuario_id, id]
        );
    } catch (error) {
        console.error('Error al actualizar dispositivo:', error);
        throw error;
    }
};

export const eliminarDispositivo = async (db, id) => {
    try {
        await db.runAsync('DELETE FROM dispositivos WHERE id = ?', [id]);
    } catch (error) {
        console.error('Error al eliminar dispositivo:', error);
        throw error;
    }
};

export const obtenerDispositivos = async (db) => {
    try {
        return await db.getAllAsync(`
            SELECT 
                d.id, 
                d.nombre, 
                d.modelo, 
                d.numero_serie, 
                d.estado, 
                d.usuario_id,
                u.nombre as nombre_usuario
            FROM dispositivos d
            LEFT JOIN usuarios u ON d.usuario_id = u.id
            ORDER BY d.nombre
        `);
    } catch (error) {
        console.error('Error al obtener dispositivos:', error);
        throw error;
    }
};

export const obtenerDispositivosPorUsuario = async (db, usuario_id) => {
    try {
        return await db.getAllAsync(`
            SELECT * FROM dispositivos
            WHERE usuario_id = ?
            ORDER BY nombre
        `, [usuario_id]);
    } catch (error) {
        console.error('Error al obtener dispositivos por usuario:', error);
        throw error;
    }
};

export const inicializarDB = async (db) => {
    try {
        await migrarBaseDatos(db);
        
        // Verificar si la tabla usuarios tiene la columna telefono
        const tableInfo = await db.getAllAsync("PRAGMA table_info(usuarios)");
        const hasTelefonoColumn = tableInfo.some(col => col.name === 'telefono');
        
        // Si no existe la columna telefono, añadirla
        if (!hasTelefonoColumn) {
            await db.execAsync("ALTER TABLE usuarios ADD COLUMN telefono TEXT");
            console.log("Columna telefono añadida a la tabla usuarios");
        }
    } catch (error) {
        console.error("Error al inicializar la base de datos:", error);
        throw error;
    }
};