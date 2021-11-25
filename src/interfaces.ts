export interface Conf {
	autoInsertDate: string;
	customUtilities: string;
	autoClassTransformer: boolean;
	enableUtilities: boolean;
	boolTransformText: string;
	dataTransformText: string;
}

//array of types

const mysqlString: string[] = ['text', 'varchar', 'char', 'binary', 'varbinary', 'blob', 'enum', 'set'];
