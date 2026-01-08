import { MigrationInterface, QueryRunner } from "typeorm";

export class MigracionCompletaPos1753120000000 implements MigrationInterface {
    name = 'MigracionCompletaPos1753120000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Crear extensión uuid-ossp si no existe
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        
        // 2. Crear el esquema api_pacifico
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "api_pacifico"`);
        
        // 3. Crear tabla de roles
        await queryRunner.query(`
            CREATE TABLE "api_pacifico"."roles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "nombre" character varying NOT NULL, 
                "descripcion" character varying, 
                "permisos" json, 
                "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_roles" PRIMARY KEY ("id")
            )
        `);

        // 4. Crear tabla de usuarios
        await queryRunner.query(`
            CREATE TABLE "api_pacifico"."usuarios" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "nombre" character varying NOT NULL, 
                "correo" character varying NOT NULL, 
                "contraseña" character varying NOT NULL, 
                "rol_id" uuid, 
                "foto_perfil" character varying, 
                "activo" boolean NOT NULL DEFAULT true, 
                "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(), 
                "fecha_actualizacion" TIMESTAMP NOT NULL DEFAULT now(), 
                "codigo_recuperacion" VARCHAR(4), 
                "fecha_expiracion_codigo" TIMESTAMP, 
                "codigo_usado" boolean NOT NULL DEFAULT false, 
                CONSTRAINT "UQ_usuarios_correo" UNIQUE ("correo"), 
                CONSTRAINT "PK_usuarios" PRIMARY KEY ("id")
            )
        `);

        // 5. Crear tabla de categorias
        await queryRunner.query(`
            CREATE TABLE "api_pacifico"."categorias" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "nombre" character varying NOT NULL, 
                "descripcion" character varying, 
                "imagen" character varying, 
                "activo" boolean NOT NULL DEFAULT true, 
                "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_categorias" PRIMARY KEY ("id")
            )
        `);

        // 6. Crear tabla de productos
        await queryRunner.query(`
            CREATE TABLE "api_pacifico"."productos" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "codigo_barras" character varying, 
                "nombre" character varying NOT NULL, 
                "descripcion" text, 
                "categoria_id" uuid, 
                "precio_venta" decimal(10,2) NOT NULL, 
                "precio_compra" decimal(10,2), 
                "stock" integer NOT NULL DEFAULT 0, 
                "stock_minimo" integer NOT NULL DEFAULT 0, 
                "imagen" character varying, 
                "activo" boolean NOT NULL DEFAULT true, 
                "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(), 
                "fecha_actualizacion" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "UQ_productos_codigo_barras" UNIQUE ("codigo_barras"), 
                CONSTRAINT "PK_productos" PRIMARY KEY ("id")
            )
        `);

        // 7. Crear tabla de clientes
        await queryRunner.query(`
            CREATE TABLE "api_pacifico"."clientes" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "nombre" character varying NOT NULL, 
                "correo" character varying, 
                "telefono" character varying, 
                "direccion" text, 
                "tipo_documento" character varying, 
                "numero_documento" character varying, 
                "fecha_nacimiento" date, 
                "activo" boolean NOT NULL DEFAULT true, 
                "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(), 
                "fecha_actualizacion" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_clientes" PRIMARY KEY ("id")
            )
        `);

        // 8. Crear tabla de metodos_pago
        await queryRunner.query(`
            CREATE TABLE "api_pacifico"."metodos_pago" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "nombre" character varying NOT NULL, 
                "descripcion" character varying, 
                "activo" boolean NOT NULL DEFAULT true, 
                "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_metodos_pago" PRIMARY KEY ("id")
            )
        `);

        // 9. Crear tabla de ventas
        await queryRunner.query(`
            CREATE TABLE "api_pacifico"."ventas" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "numero_factura" character varying NOT NULL, 
                "cliente_id" uuid, 
                "usuario_id" uuid NOT NULL, 
                "subtotal" decimal(10,2) NOT NULL DEFAULT 0, 
                "descuento" decimal(10,2) NOT NULL DEFAULT 0, 
                "impuesto" decimal(10,2) NOT NULL DEFAULT 0, 
                "total" decimal(10,2) NOT NULL DEFAULT 0, 
                "metodo_pago_id" uuid, 
                "estado" character varying(50) NOT NULL DEFAULT 'completada', 
                "fecha_venta" TIMESTAMP NOT NULL DEFAULT now(), 
                "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "UQ_ventas_numero_factura" UNIQUE ("numero_factura"), 
                CONSTRAINT "PK_ventas" PRIMARY KEY ("id")
            )
        `);

        // 10. Crear tabla de detalle_ventas
        await queryRunner.query(`
            CREATE TABLE "api_pacifico"."detalle_ventas" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "venta_id" uuid NOT NULL, 
                "producto_id" uuid NOT NULL, 
                "cantidad" integer NOT NULL, 
                "precio_unitario" decimal(10,2) NOT NULL, 
                "descuento" decimal(10,2) NOT NULL DEFAULT 0, 
                "subtotal" decimal(10,2) NOT NULL, 
                "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_detalle_ventas" PRIMARY KEY ("id")
            )
        `);

        // 11. Crear tabla de proveedores
        await queryRunner.query(`
            CREATE TABLE "api_pacifico"."proveedores" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "nombre" character varying NOT NULL, 
                "correo" character varying, 
                "telefono" character varying, 
                "direccion" text, 
                "contacto" character varying, 
                "activo" boolean NOT NULL DEFAULT true, 
                "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(), 
                "fecha_actualizacion" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_proveedores" PRIMARY KEY ("id")
            )
        `);

        // 12. Crear tabla de compras
        await queryRunner.query(`
            CREATE TABLE "api_pacifico"."compras" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "numero_factura" character varying, 
                "proveedor_id" uuid NOT NULL, 
                "usuario_id" uuid NOT NULL, 
                "subtotal" decimal(10,2) NOT NULL DEFAULT 0, 
                "impuesto" decimal(10,2) NOT NULL DEFAULT 0, 
                "total" decimal(10,2) NOT NULL DEFAULT 0, 
                "estado" character varying(50) NOT NULL DEFAULT 'pendiente', 
                "fecha_compra" TIMESTAMP NOT NULL DEFAULT now(), 
                "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_compras" PRIMARY KEY ("id")
            )
        `);

        // 13. Crear tabla de detalle_compras
        await queryRunner.query(`
            CREATE TABLE "api_pacifico"."detalle_compras" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "compra_id" uuid NOT NULL, 
                "producto_id" uuid NOT NULL, 
                "cantidad" integer NOT NULL, 
                "precio_unitario" decimal(10,2) NOT NULL, 
                "subtotal" decimal(10,2) NOT NULL, 
                "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_detalle_compras" PRIMARY KEY ("id")
            )
        `);

        // 14. Crear tabla de inventario
        await queryRunner.query(`
            CREATE TABLE "api_pacifico"."inventario" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "producto_id" uuid NOT NULL, 
                "tipo_movimiento" character varying(50) NOT NULL, 
                "cantidad" integer NOT NULL, 
                "motivo" text, 
                "referencia_id" uuid, 
                "usuario_id" uuid NOT NULL, 
                "fecha_movimiento" TIMESTAMP NOT NULL DEFAULT now(), 
                "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_inventario" PRIMARY KEY ("id")
            )
        `);

        // 15. Crear tabla de descuentos
        await queryRunner.query(`
            CREATE TABLE "api_pacifico"."descuentos" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "codigo" character varying NOT NULL, 
                "tipo" character varying(50) NOT NULL, 
                "valor" decimal(10,2) NOT NULL, 
                "fecha_inicio" TIMESTAMP NOT NULL, 
                "fecha_fin" TIMESTAMP NOT NULL, 
                "activo" boolean NOT NULL DEFAULT true, 
                "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "UQ_descuentos_codigo" UNIQUE ("codigo"), 
                CONSTRAINT "PK_descuentos" PRIMARY KEY ("id")
            )
        `);

        // 16. Crear tabla de configuracion
        await queryRunner.query(`
            CREATE TABLE "api_pacifico"."configuracion" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "clave" character varying NOT NULL, 
                "valor" text, 
                "tipo" character varying(50), 
                "descripcion" character varying, 
                "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "UQ_configuracion_clave" UNIQUE ("clave"), 
                CONSTRAINT "PK_configuracion" PRIMARY KEY ("id")
            )
        `);

        // 17. Agregar constraints de claves foráneas
        await queryRunner.query(`
            ALTER TABLE "api_pacifico"."usuarios" 
            ADD CONSTRAINT "FK_usuarios_rol_id" 
            FOREIGN KEY ("rol_id") 
            REFERENCES "api_pacifico"."roles"("id") 
            ON DELETE SET NULL ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "api_pacifico"."productos" 
            ADD CONSTRAINT "FK_productos_categoria_id" 
            FOREIGN KEY ("categoria_id") 
            REFERENCES "api_pacifico"."categorias"("id") 
            ON DELETE SET NULL ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "api_pacifico"."ventas" 
            ADD CONSTRAINT "FK_ventas_cliente_id" 
            FOREIGN KEY ("cliente_id") 
            REFERENCES "api_pacifico"."clientes"("id") 
            ON DELETE SET NULL ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "api_pacifico"."ventas" 
            ADD CONSTRAINT "FK_ventas_usuario_id" 
            FOREIGN KEY ("usuario_id") 
            REFERENCES "api_pacifico"."usuarios"("id") 
            ON DELETE RESTRICT ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "api_pacifico"."ventas" 
            ADD CONSTRAINT "FK_ventas_metodo_pago_id" 
            FOREIGN KEY ("metodo_pago_id") 
            REFERENCES "api_pacifico"."metodos_pago"("id") 
            ON DELETE SET NULL ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "api_pacifico"."detalle_ventas" 
            ADD CONSTRAINT "FK_detalle_ventas_venta_id" 
            FOREIGN KEY ("venta_id") 
            REFERENCES "api_pacifico"."ventas"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "api_pacifico"."detalle_ventas" 
            ADD CONSTRAINT "FK_detalle_ventas_producto_id" 
            FOREIGN KEY ("producto_id") 
            REFERENCES "api_pacifico"."productos"("id") 
            ON DELETE RESTRICT ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "api_pacifico"."compras" 
            ADD CONSTRAINT "FK_compras_proveedor_id" 
            FOREIGN KEY ("proveedor_id") 
            REFERENCES "api_pacifico"."proveedores"("id") 
            ON DELETE RESTRICT ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "api_pacifico"."compras" 
            ADD CONSTRAINT "FK_compras_usuario_id" 
            FOREIGN KEY ("usuario_id") 
            REFERENCES "api_pacifico"."usuarios"("id") 
            ON DELETE RESTRICT ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "api_pacifico"."detalle_compras" 
            ADD CONSTRAINT "FK_detalle_compras_compra_id" 
            FOREIGN KEY ("compra_id") 
            REFERENCES "api_pacifico"."compras"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "api_pacifico"."detalle_compras" 
            ADD CONSTRAINT "FK_detalle_compras_producto_id" 
            FOREIGN KEY ("producto_id") 
            REFERENCES "api_pacifico"."productos"("id") 
            ON DELETE RESTRICT ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "api_pacifico"."inventario" 
            ADD CONSTRAINT "FK_inventario_producto_id" 
            FOREIGN KEY ("producto_id") 
            REFERENCES "api_pacifico"."productos"("id") 
            ON DELETE RESTRICT ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "api_pacifico"."inventario" 
            ADD CONSTRAINT "FK_inventario_usuario_id" 
            FOREIGN KEY ("usuario_id") 
            REFERENCES "api_pacifico"."usuarios"("id") 
            ON DELETE RESTRICT ON UPDATE CASCADE
        `);

        // 18. Insertar roles básicos del sistema
        await queryRunner.query(`
            INSERT INTO "api_pacifico"."roles" ("id", "nombre", "descripcion") VALUES
            (uuid_generate_v4(), 'Administrador', 'Administrador del sistema con todos los permisos'),
            (uuid_generate_v4(), 'Vendedor', 'Vendedor con permisos para realizar ventas'),
            (uuid_generate_v4(), 'Cajero', 'Cajero con permisos para procesar pagos'),
            (uuid_generate_v4(), 'Supervisor', 'Supervisor con permisos de gestión')
        `);

        // 19. Insertar métodos de pago básicos
        await queryRunner.query(`
            INSERT INTO "api_pacifico"."metodos_pago" ("id", "nombre", "descripcion") VALUES
            (uuid_generate_v4(), 'Efectivo', 'Pago en efectivo'),
            (uuid_generate_v4(), 'Tarjeta de Débito', 'Pago con tarjeta de débito'),
            (uuid_generate_v4(), 'Tarjeta de Crédito', 'Pago con tarjeta de crédito'),
            (uuid_generate_v4(), 'Transferencia', 'Pago por transferencia bancaria')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar constraints de claves foráneas
        await queryRunner.query(`ALTER TABLE "api_pacifico"."inventario" DROP CONSTRAINT "FK_inventario_usuario_id"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."inventario" DROP CONSTRAINT "FK_inventario_producto_id"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."detalle_compras" DROP CONSTRAINT "FK_detalle_compras_producto_id"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."detalle_compras" DROP CONSTRAINT "FK_detalle_compras_compra_id"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."compras" DROP CONSTRAINT "FK_compras_usuario_id"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."compras" DROP CONSTRAINT "FK_compras_proveedor_id"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."detalle_ventas" DROP CONSTRAINT "FK_detalle_ventas_producto_id"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."detalle_ventas" DROP CONSTRAINT "FK_detalle_ventas_venta_id"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."ventas" DROP CONSTRAINT "FK_ventas_metodo_pago_id"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."ventas" DROP CONSTRAINT "FK_ventas_usuario_id"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."ventas" DROP CONSTRAINT "FK_ventas_cliente_id"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."productos" DROP CONSTRAINT "FK_productos_categoria_id"`);
        await queryRunner.query(`ALTER TABLE "api_pacifico"."usuarios" DROP CONSTRAINT "FK_usuarios_rol_id"`);

        // Eliminar tablas en orden inverso
        await queryRunner.query(`DROP TABLE "api_pacifico"."configuracion"`);
        await queryRunner.query(`DROP TABLE "api_pacifico"."descuentos"`);
        await queryRunner.query(`DROP TABLE "api_pacifico"."inventario"`);
        await queryRunner.query(`DROP TABLE "api_pacifico"."detalle_compras"`);
        await queryRunner.query(`DROP TABLE "api_pacifico"."compras"`);
        await queryRunner.query(`DROP TABLE "api_pacifico"."proveedores"`);
        await queryRunner.query(`DROP TABLE "api_pacifico"."detalle_ventas"`);
        await queryRunner.query(`DROP TABLE "api_pacifico"."ventas"`);
        await queryRunner.query(`DROP TABLE "api_pacifico"."metodos_pago"`);
        await queryRunner.query(`DROP TABLE "api_pacifico"."clientes"`);
        await queryRunner.query(`DROP TABLE "api_pacifico"."productos"`);
        await queryRunner.query(`DROP TABLE "api_pacifico"."categorias"`);
        await queryRunner.query(`DROP TABLE "api_pacifico"."usuarios"`);
        await queryRunner.query(`DROP TABLE "api_pacifico"."roles"`);

        // Eliminar el esquema y todas sus tablas
        await queryRunner.query(`DROP SCHEMA IF EXISTS "api_pacifico" CASCADE`);
    }
}

