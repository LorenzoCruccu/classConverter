// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {



	// *** java to typescript
	let be2fe = vscode.commands.registerCommand('classConverter.java2typescript', async () => {

		//confs
		const autoInsertDate: string = await vscode.workspace.getConfiguration().get('be2fe.classTransformerDate')!;
		const customUtilities: string = await vscode.workspace.getConfiguration().get('be2fe.utilities')!;
		const autoClassTransformer: boolean = await vscode.workspace.getConfiguration().get('be2fe.autoClassTransformerImplement')!;
		//
		// Get the active text editor
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const document = editor.document;
			editor.edit(editBuilder => {
				editor.selections.forEach(sel => {
					const range = sel.isEmpty ? document.getWordRangeAtPosition(sel.start) || sel : sel;
					let word = document.getText(range).trim(); //word contiene la selezione

					// utilities (commento iniziale sopra gli attributi)

					let utilities = customUtilities ? '/*\n' + customUtilities + '\n*/\n' : `/*\n ### Go to conf.be2fe.utilities if you want to custom me ### \n @Transform(dateTransform)\n @Transform(boolTransform) \n @Type(() => User) \n @Exclude({ toPlainOnly: true }) \n*/\n`;

					let result: string[] = [...utilities];
					//controllo per non sminchiare tutto
					if (word.startsWith('@') && word.endsWith(';')) {
						word.split(';').map(c => {
							//rimuove da @ a private, infine va a capo e aggiunge ai risultati da stampare
							let converted = c.split('private').filter(a => !a.includes('@'))[0].toLowerCase().trimLeft();
							console.log(converted);
							if (converted.startsWith('long') || converted.startsWith('integer') || converted.startsWith('double')) {
								converted = converted.split(" ").pop() + ':number;\n';	//general			
							} else
								if (converted.startsWith('string')) {
									converted = converted.replace('string', '').trimLeft() + ':string;\n';
								} else
									if (converted.startsWith('boolean')) {
										converted = converted.replace('boolean', '') + ':boolean;\n';
										autoClassTransformer ? converted = '@Transform(boolTransform)\n' + converted : '';
									}
							converted = checkInsertDate(converted);

							result.push(converted);
						});

						// apply the (accumulated) replacement(s) (if multiple cursors/selections)
						editBuilder.replace(range, result.join(''));
						vscode.window.showInformationMessage('[be2fe]: Done! :)');
					} else {
						vscode.window.showErrorMessage('[be2fe]: Error :(');
					}
				});
			});
		}

		function checkInsertDate(converted: string): string {
			if (autoInsertDate) {
				autoInsertDate.split(' ').forEach(value => {
					if (converted.includes(value)) {
						return converted = '@Transform(dateTransform)\n' + converted;
					}
				});
			}
			return converted;
		}

	});


	context.subscriptions.push(be2fe);


	//TODO: to check promise (only for studing purpose)
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

	//TODO: the replacement script could be improved

	//DONE: async get confs

