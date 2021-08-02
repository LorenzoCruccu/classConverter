// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// *** java to typescript
	let be2fe = vscode.commands.registerCommand('classConverter.java2typescript', () => {
		
		// Get the active text editor
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const document = editor.document;
			editor.edit(editBuilder => {
				editor.selections.forEach(sel => {
					const range = sel.isEmpty ? document.getWordRangeAtPosition(sel.start) || sel : sel;
					let word = document.getText(range).trim(); //word contiene la selezione

					// utilities (commento iniziale sopra gli attributi)
					const customUtilities: any = vscode.workspace.getConfiguration().get('conf.be2fe.utilities');
					let utilities = customUtilities ? '/*\n' + customUtilities + '\n*/\n' :  `/*\n @Transform(dateTransform)\n @Transform(boolTransform)
					\n*/\n`;

					let result: string[] = [...utilities];
					//controllo per non sminchiare tutto
					if(word.startsWith('@') && word.endsWith(';')){
					word.split(';').map(c => {
						//rimuove da @ a private, infine va a capo e aggiunge ai risultati da stampare
						let converted = c.split('private').filter(a => !a.includes('@'))[0].toLowerCase();
						console.log(converted);
						if (converted.includes('long') || converted.includes('integer') || converted.includes('int')){
							converted = converted.split(" ").pop() + ':number;\n';					
							}
						if(converted.includes('string')){
							converted = converted.replace('string', '') + ':string;\n';
						}
						if (converted.includes('boolean')) {
							converted = converted.replace('boolean', '') + ':boolean;\n';
							converted = '@Transform(boolTransform)\n' + converted;
						}
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
	},);


	context.subscriptions.push(be2fe);




}

// this method is called when your extension is deactivated
export function deactivate() {}


	//TODO: impostazione "classTransformer" custom
	// se attiva, aggiungo i @Transform etc..

	//DONE: Impostazione per i commenti utilities

	//TODO: stessa cosa ma MySql -> Typescript

	//TODO: the replacement script could be improved

