// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Conf } from './interfaces';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// *** java to typescript
	let java2typescript = vscode.commands.registerCommand('classConverter.java2typescript', async () => {
		//confs
		let confs: Conf = {} as Conf;

		await getConfs();
		//
		// Get the active text editor
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const document = editor.document;
			editor.edit(editBuilder => {
				editor.selections.forEach(async sel => {
					const range = sel.isEmpty ? document.getWordRangeAtPosition(sel.start) || sel : sel;
					let word = document.getText(range).trim(); //word contiene la selezione

					// utilities (commento iniziale sopra gli attributi)

					let utilities = confs.customUtilities ? '/*\n' + confs.customUtilities + '\n*/\n' : `/*\n ### Go to conf.be2fe.utilities if you want to custom me ### \n @Transform(dateTransform)\n @Transform(boolTransform) \n @Type(() => User) \n @Exclude({ toPlainOnly: true }) \n*/\n`;

					let result: string[] = [...utilities];
					//controllo per non sminchiare tutto
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
										confs.autoClassTransformer ? converted = '@Transform(boolTransform)\n' + converted : '';
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
						return converted = '@Transform(dateTransform)\n' + converted;
					}
				});
			}
			return converted;
		}

		async function getConfs() {
			try {
				confs.autoInsertDate = await vscode.workspace.getConfiguration().get('be2fe.classTransformerDate')!;
				confs.customUtilities = await vscode.workspace.getConfiguration().get('be2fe.utilities')!;
				confs.autoClassTransformer = await vscode.workspace.getConfiguration().get('be2fe.autoClassTransformerImplement')!;

			} catch (error) {
				console.log(error);
				vscode.window.showErrorMessage('[be2fe]: Error while getting your configurations :(');
			}
		}

	});

	// *** mysql to typescript
	let mysql2typescript = vscode.commands.registerCommand('classConverter.mysql2typescript', async () => {
		//confs
		let confs: Conf = {} as Conf;
		await getConfs();
		//
		// Get the active text editor
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			editor.edit(editBuilder => {
				editor.selections.forEach(async sel => {
					const range = sel.isEmpty ? document.getWordRangeAtPosition(sel.start) || sel : sel;
					let word = document.getText(range).trim(); //word contiene la selezione

					// utilities (commento iniziale sopra gli attributi)

					let utilities = confs.customUtilities ? '/*\n' + confs.customUtilities + '\n*/\n' : `/*\n ### Go to conf.be2fe.utilities if you want to custom me ### \n @Transform(dateTransform)\n @Transform(boolTransform) \n @Type(() => User) \n @Exclude({ toPlainOnly: true }) \n*/\n`;

					let result: string[] = [...utilities];
					//controllo per non sminchiare tutto
					if (word.startsWith('CREATE')) {
						const a = word.substring(word.indexOf('(') + 1).split('PRIMARY')[0];
						console.log(a);
						let b = a.split(',');
						b.pop();
						b.map(c => {
							//	converted = c.substring(c.indexOf('`') + 1);
							const line = c.split('`');
							console.log(line);
							let converted = line[1];
							if (line[2].trimLeft().startsWith('bigint') || line[2].trimLeft().startsWith('int') || line[2].trimLeft().startsWith('smallint') || line[2].trimLeft().startsWith('tinyint') || line[2].trimLeft().startsWith('mediumint') || line[2].trimLeft().startsWith('decimal') || line[2].trimLeft().startsWith('float') || line[2].trimLeft().startsWith('double') || line[2].trimLeft().startsWith('integer')) {
								converted = converted.split(" ").pop() + ':number;\n';	//general			
							} else
								if (line[2].trimLeft().startsWith('varchar')) {
									converted = converted.replace('string', '') + ':string;\n';
								} else
									if (line[2].trimLeft().startsWith('boolean')) {
										converted = converted.replace('boolean', '') + ':boolean;\n';
										confs.autoClassTransformer ? converted = '@Transform(boolTransform)\n' + converted : '';
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
						return converted = '@Transform(dateTransform)\n' + converted;
					}
				});
			}
			return converted;
		}

		async function getConfs() {
			try {
				confs.autoInsertDate = await vscode.workspace.getConfiguration().get('be2fe.classTransformerDate')!;
				confs.customUtilities = await vscode.workspace.getConfiguration().get('be2fe.utilities')!;
				confs.autoClassTransformer = await vscode.workspace.getConfiguration().get('be2fe.autoClassTransformerImplement')!;

			} catch (error) {
				console.log(error);
				vscode.window.showErrorMessage('[be2fe]: Error while getting your configurations :(');
			}
		}
	});


	context.subscriptions.push(java2typescript);
	context.subscriptions.push(mysql2typescript);



	// to check promise (only for studing purpose)
	/*
		function checkInsertDate(converted: string): Promise<string> {
		return new Promise((resolve) => {
			autoInsertDate.split(' ').forEach(value => {
				if (converted.includes(value)) {
					resolve('@Transform(dateTransform)\n' + converted);
				}
			});
		});
	}
	*/



}

// this method is called when your extension is deactivated
export function deactivate() {}


	//DONE: impostazione "classTransformer" custom
	// se attiva, aggiungo i @Transform etc..

	//DONE: Impostazione per i commenti utilities

	//TODO: stessa cosa ma MySql -> Typescript

	//TODO: the replacement script could be improved // improved

	//DONE: async get confs

