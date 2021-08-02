// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "classConverter" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('classConverter.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from classConverter!');
	});

	let be2fe = vscode.commands.registerCommand('classConverter.be2fe', () => {
		
		// Get the active text editor
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const document = editor.document;
			editor.edit(editBuilder => {
				editor.selections.forEach(sel => {
					const range = sel.isEmpty ? document.getWordRangeAtPosition(sel.start) || sel : sel;
					let word = document.getText(range).trim(); //word contiene la selezione

					const utilities=`/*\n @Transform(dateTransform)\n @Transform(boolTransform)
					\n*/\n`;

					let result: string[] = [...utilities];
					//controllo per non sminchiare tutto
					if(word.startsWith('@') && word.endsWith(';')){
					word.split(';').map(c => {
						//rimuove da @ a private, infine va a capo e aggiunge ai risultati da stampare
						let converted = c.split('private').filter(a => !a.includes('@'))[0];
						console.log(converted);
						if (converted.includes('long')){
							converted = converted.replace('long', '') + ':number;\n';
						}
						if (converted.includes('Long')) {
							converted = converted.replace('Long', '') + ':number;\n';
						}
						if (converted.includes('Integer')) {
							converted = converted.replace('Integer', '') + ':number;\n';
						}
						if (converted.includes('int')) {
							converted = converted.replace('int', '') + ':number;\n';
						}

						if(converted.includes('String')){
							converted = converted.replace('String', '') + ':string;\n';
						}
						
						if (converted.includes('Boolean')) {
							converted = converted.replace('Boolean', '') + ':boolean;\n';
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

