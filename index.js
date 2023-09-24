const filepix = require("filepix");
const fs = require("fs");
const readline = require("readline");
const pdfkit = require("pdfkit");
const { resolve } = require('path');

let fileName = "";
let outputImgDir = "";

function pdf2png(fileName) {
	outputImgDir = `${__dirname}/outputPNGs/${fileName.replace(".pdf", "")}`;

	if (!fs.existsSync(outputImgDir)) {
		fs.mkdirSync(outputImgDir, { recursive: true });
	}

	const outputImgsPath = `${outputImgDir}/${fileName.replace(".pdf", "")}`;

	filepix.PDF2img(fileName, outputImgsPath);
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

			resolve(fileName);
		});
	});
}

function getImgFiles(dir) {
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

function img2pdf(imgFiles, inputDir, outputPdfDir) {
	const pdf = new pdfkit();
	const pageWidth = pdf.page.width;
	const pageHeight = pdf.page.height;
	const imgWidth = 480;
	const imgHeight = 330;

	// const cover = false;
	// if (cover) {
	// 	pdf.lineWidth(8);
	// 	pdf
	// 		.rect((pageWidth - 500) / 2, 100, 500, 150)
	// 		.lineJoin("round")
	// 		.stroke("#B6454B");
	// 	pdf
	// 		.rect((pageWidth - 500) / 2 + 50, 300, 400, 1)
	// 		.lineJoin("round")
	// 		.stroke("#B6454B");

	// 	pdf.fontSize(24).text(" ", { align: "center" });
	// 	pdf.fontSize(24).text(" ", { align: "center" });
	// 	pdf.fontSize(24).text(" ", { align: "center" });
	// 	pdf.fontSize(24).text(title, { align: "center" });
	// 	pdf.fontSize(18).text(subtitle, { align: "center" });

	// 	pdf.addPage();
	// }

	for (let i = 0; i < imgFiles.length; i += 2) {
		const image1 = `${inputDir}/${imgFiles[i]}`;
		const image2 = i + 1 < imgFiles.length ? `${inputDir}/${imgFiles[i + 1]}` : null;

		// cria uma nova página
		if (i != 0) pdf.addPage();

		if (image1) {
			pdf.image(image1, 70, 40, { width: imgWidth, height: imgHeight });
			pdf.rect(70, 40, imgWidth, imgHeight).lineWidth(8).stroke("#EEE");
		}

		if (image2) {
			pdf.image(image2, 70, 400, { width: imgWidth, height: imgHeight });
			pdf.rect(70, 400, imgWidth, imgHeight).stroke("#EEE");
		}

		// adiciona um marcador no rodapé
		pdf
			.fontSize(12)
			.fillColor("black")
			.text(`Page ${i / 2 + 1}`, pageWidth - 50, pageHeight - 30, { align: "right" });
	}

	if (!fs.existsSync(outputPdfDir)) {
		fs.mkdirSync(outputPdfDir, { recursive: true });
	}

	outputPdfPath = `${outputPdfDir}/${fileName.replace(".pdf", "-converted.pdf")}`;
	pdf.pipe(fs.createWriteStream(outputPdfPath));
	pdf.end();

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
		fileName = await chooseFile(rl, files);

		// executa a conversão do arquivo para pngs
		await pdf2png(fileName);

		const imgFiles = await getImgFiles(outputImgDir);

		const outputPdfDir = `${__dirname}/outputPDFs`;
		await img2pdf(imgFiles, outputImgDir, outputPdfDir);

	} catch (err) {
		// pega possiveis erros
		console.error(err);
	}
}

main().then(() => {
	console.log("Conversão finalizada.");
});
