const filepix = require("filepix");
const fs = require("fs");
const readline = require("readline");

let outputImgsDir = ''

function pdf2png(fileName) {
	outputImgsDir = `${__dirname}/outputPNGs/${fileName.replace(".pdf", "")}`;

	if (!fs.existsSync(outputImgsDir)) {
		fs.mkdirSync(outputImgsDir, { recursive: true });
	}

	const outputImgsPath = `${outputImgsDir}/${fileName.replace(".pdf", "")}`;

	console.log(`Extraindo imagens de ${fileName}`);
	filepix.PDF2img(fileName, outputImgsPath).then(() => {
		console.log(`Imagens extraídas para ${outputImgsDir}`);
	});
}

function getFilesInDirectory(directory) {
	return new Promise((resolve, reject) => {
		fs.readdir(directory, (err, files) => {
			if (err) {
				console.error("Erro ao ler os arquivos da pasta:", err);
				reject(err);
				return;
			}
			resolve(files);
		});
	});
}

function displayFiles(files) {
	console.log("Arquivos disponíveis:");
	files.forEach((file, index) => {
		console.log(`${index + 1}: ${file}`);
	});
}

function chooseFile(rl, files) {
	return new Promise((resolve, reject) => {
		rl.question("Escolha o número do arquivo desejado: ", (answer) => {
			rl.close();
			const fileNumber = parseInt(answer) - 1;

			if (isNaN(fileNumber) || fileNumber < 0 || fileNumber >= files.length) {
				console.error("Número de arquivo inválido.");
				reject(new Error("Número de arquivo inválido."));
				return;
			}
			if (!files[fileNumber].includes(".pdf")) {
				console.error("O arquivo escolhido não é um PDF.");
                reject(new Error("O arquivo escolhido não é um PDF."));
				return;
			}

			const fileName = files[fileNumber];

            resolve(fileName)
		});
	});
}

function getImgsInDirectory(dir) {
    return new Promise((resolve, reject) => {
		const imgsFiles = fs
			.readdirSync(dir)
			.filter((file) => file.endsWith(".jpg") || file.endsWith(".png"))
			.sort((a, b) => {
				const aNum = parseInt(a.match(/\d+/)[0]);
				const bNum = parseInt(b.match(/\d+/)[0]);
				return aNum - bNum;
			});

		resolve(imgsFiles);
	});
}

async function main() {
    try {
        // lista arquivos no diretório
        const files = await getFilesInDirectory(__dirname);
        displayFiles(files);
        
        // pede para o usuário escolher um arquivo pdf
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        const fileName = await chooseFile(rl, files);
    
        // executa a conversão do arquivo para pngs
        pdf2png(fileName);

        const imageFiles = await getImgsInDirectory(outputImgsDir);
    }
    catch (err){
        // pega possiveis erros
        console.err(err);
    }

}

main();
