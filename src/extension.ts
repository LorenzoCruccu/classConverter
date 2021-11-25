// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { Conf } from './interfaces';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const confs: Conf = {} as Conf;

	// *** java to typescript
	const java2typescript = vscode.commands.registerCommand('classConverter.java2typescript', async () => {

		//confs
		await getConfs();

		// Get the active text editor
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			editor.edit(editBuilder => {
				editor.selections.forEach(sel => {
					const range = sel.isEmpty ? document.getWordRangeAtPosition(sel.start) || sel : sel;
					let word = document.getText(range).trim(); //word contiene la selezione

					// utilities (commento iniziale sopra gli attributi)

					let utilities = confs.enableUtilities ? confs.customUtilities ? '/*\n' + confs.customUtilities + '\n*/\n' : `/*\n ### Go to be2fe confs if you want to custom me ### \n @Transform(dateTransform)\n @Transform(boolTransform) \n @Type(() => User) \n @Exclude({ toPlainOnly: true }) \n*/\n` : '';

					let result: string[] = [...utilities];
					//controllo
					if (word.startsWith('@') && word.endsWith(';')) {
						word.split(';').map(c => {
							//rimuove da @ a private, infine va a capo e aggiunge ai risultati da stampare
							let converted = c.split('private').filter(a => !a.includes('@'))[0].toLowerCase().trimLeft();
							console.log(converted);
							if (converted.startsWith('long') || converted.startsWith('integer') || converted.startsWith('double') || converted.startsWith('int')) {
								converted = converted.split(" ").pop() + ':number;\n';	//general			
							} else
								if (converted.startsWith('string')) {
									converted = converted.replace('string', '') + ':string;\n';
								} else
									if (converted.startsWith('boolean')) {
										converted = converted.replace('boolean', '') + ':boolean;\n';
										confs.autoClassTransformer ? converted = `@Transform(${confs.boolTransformText})\n` + converted : '';
										console.log(confs.autoClassTransformer);
									}
							converted = checkInsertDate(converted);

							result.push(converted);
						});
						// apply the (accumulated) replacement(s) (if multiple cursors/selections)
						editBuilder.replace(range, result.join(''));
						vscode.workspace.saveAll(true);

						vscode.window.showInformationMessage('[be2fe]: Done! :)');
					} else {
						vscode.window.showErrorMessage('[be2fe]: Error :(');
					}
				});
			});
		}

		function checkInsertDate(converted: string): string {
			if (confs.autoInsertDate) {
				confs.autoInsertDate.split(' ').forEach(value => {
					if (converted.includes(value)) {
						return converted = `@Transform(${confs.dataTransformText})\n` + converted;
					}
				});
			}
			return converted;
		}

	});

	// *** mysql to typescript
	const mysql2typescript = vscode.commands.registerCommand('classConverter.mysql2typescript', async () => {
		//confs
		let initClass: boolean = false;
		await getConfs();

		//
		await vscode.window
			.showQuickPick(
				["Yes", "No"], { placeHolder: 'Do you want to init the class creation? (export class...)' }
			)
			.then((answer) => {
				if (answer === "Yes") {
					initClass = true;
				}
			});
		// Get the active text editor
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			editor.edit(editBuilder => {
				const sel = editor.selection;
				const range = sel.isEmpty ? document.getWordRangeAtPosition(sel.start) || sel : sel;
				let word = document.getText(range).trim(); //word contiene la selezione

				// utilities (commento iniziale sopra gli attributi)
				let utilities = confs.enableUtilities ? confs.customUtilities ? '/*\n' + confs.customUtilities + '\n*/\n' : `/*\n ### Go to be2fe confs if you want to custom me ### \n @Transform(dateTransform)\n @Transform(boolTransform) \n @Type(() => User) \n @Exclude({ toPlainOnly: true }) \n*/\n` : '';

				let result: string[] = [];
				if (initClass) {
					let a = word.substring(word.indexOf('`') + 1).split('`')[0];
					a = capitalizeFirstLetter(a);
					let init = '\n export class ' + a + '{\n';
					result = [...init];
					//console.log(result);
				}
				result.push(utilities);
				//	console.log(result);

				//controllo
				if (word.startsWith('CREATE')) {
					const a = word.substring(word.indexOf('(') + 1).split('PRIMARY')[0];
					console.log(a);
					//	const regex = `,(?!(?=[^']*'[^']*(?:'[^']*'[^']*)*$))`;
					//link -> https://regex101.com/r/GZxcVV/1
					let b = a.split(`\n`);
					console.log('stringa=' + b);
					b.pop();
					b.map(c => {
						//	converted = c.substring(c.indexOf('`') + 1);
						const line = c.split('`');
						let lineType = line[2].trimLeft();
						let converted = line[1];
						if (lineType.startsWith('bigint') || lineType.startsWith('int') || lineType.startsWith('smallint') || lineType.startsWith('tinyint') || lineType.startsWith('mediumint') || lineType.startsWith('decimal') || lineType.startsWith('float') || lineType.startsWith('double') || lineType.startsWith('integer') || lineType.startsWith('numeric')) {
							converted = converted.split(" ").pop() + ':number;\n';	//general			
						} else
							if (lineType.startsWith('varchar') || lineType.startsWith('char') || lineType.startsWith('text') || lineType.startsWith('binary') || lineType.startsWith('varbinary') || lineType.startsWith('blob') || lineType.startsWith('enum') || lineType.startsWith('set')) {
								converted = converted.replace('varchar', '') + ':string;\n';
							} else
								if (lineType.startsWith('boolean')) {
									converted = converted.replace('boolean', '') + ':boolean;\n';
									confs.autoClassTransformer ? converted = `@Transform(${confs.boolTransformText})\n` + converted : '';
								}
						converted = checkInsertDate(converted);

						result.push(converted);

					});
					if (initClass) {
						result.push('\n}');
					}
					// apply the (accumulated) replacement(s) (if multiple cursors/selections)
					editBuilder.replace(range, result.join(''));
					vscode.workspace.saveAll(true);

					vscode.window.showInformationMessage('[be2fe]: Done! :)');
				} else {
					vscode.window.showErrorMessage('[be2fe]: Error :(');
				}
			});
		}

		function capitalizeFirstLetter(string: string) {
			return string[0].toUpperCase() + string.slice(1);
		}

		function checkInsertDate(converted: string): string {
			if (confs.autoInsertDate) {
				confs.autoInsertDate.split(' ').forEach(value => {
					if (converted.includes(value)) {
						return converted = `@Transform(${confs.dataTransformText})\n` + converted;
					}
				});
			}
			return converted;
		}

	});


	context.subscriptions.push(java2typescript);
	context.subscriptions.push(mysql2typescript);

	async function getConfs(): Promise<any> {
		try {
			confs.autoInsertDate = await vscode.workspace.getConfiguration().get('be2fe.classTransformerDate')!;
			confs.customUtilities = await vscode.workspace.getConfiguration().get('be2fe.utilities')!;
			confs.enableUtilities = await vscode.workspace.getConfiguration().get('be2fe.enableUtilities')!;
			confs.autoClassTransformer = await vscode.workspace.getConfiguration().get('be2fe.autoClassTransformer')!;
			confs.dataTransformText = await vscode.workspace.getConfiguration().get('be2fe.dataTransformText')!;
			confs.boolTransformText = await vscode.workspace.getConfiguration().get('be2fe.boolTransformText')!;

		} catch (error) {
			console.log(error);
			vscode.window.showErrorMessage('[be2fe]: Error while getting configurations :(');
		}
	}

}



// this method is called when your extension is deactivated
export function deactivate() {}


	//DONE: impostazione "classTransformer" custom
	// se attiva, aggiungo i @Transform etc..

	//DONE: Impostazione per i commenti utilities

	//DONE: stessa cosa ma MySql -> Typescript

	//TODO: the replacement script could be improved // improved

	//DONE: async get confs

