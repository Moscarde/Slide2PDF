const filepix = require("filepix");
const fs = require("fs");
const readline = require("readline");
const pdfkit = require("pdfkit");
const { resolve } = require("path");

let fileName = "";
let outputImgDir = "";

// converts a PDF file to a series of PNG images
async function pdf2png(fileName) {
	outputImgDir = `${__dirname}/outputPNGs/${fileName.replace(".pdf", "")}`;

	if (!fs.existsSync(outputImgDir)) {
		fs.mkdirSync(outputImgDir, { recursive: true });
	}

	const outputImgsPath = `${outputImgDir}/${fileName.replace(".pdf", "-")}`;

	await filepix.PDF2img(fileName, outputImgsPath);
}

// returns the files in a directory
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

// displays the available files
function displayFiles(files) {
	console.log("Arquivos disponíveis:");
	files.forEach((file, index) => {
		console.log(`${index + 1}: ${file}`);
	});
}

// Prompts the user to choose a file
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

// returns the image files in a directory
function getImgFiles(dir) {
	return new Promise((resolve, reject) => {
		const imgsFiles = fs
			.readdirSync(dir)
			.filter((file) => file.endsWith(".jpg") || file.endsWith(".png"))
			.map((file) => {
                const match = file.match(/(\d+)\.(jpg|png)$/); 
                return {
                  name: file,
                  number: match ? parseInt(match[1]) : -1, 
                };
              })
              .sort((a, b) => a.number - b.number) 
              .map((fileData) => fileData.name); 

		resolve(imgsFiles);
	});
}

// converts a series of PNG files to a formated PDF
function img2pdf(imgFiles, inputDir, outputPdfDir) {
	console.log(imgFiles);
	console.log(inputDir);
	console.log(outputPdfDir);
	const pdf = new pdfkit();
	const pageWidth = pdf.page.width;
	const pageHeight = pdf.page.height;
	const imgWidth = 480;
	const imgHeight = 330;

	// ~~~~cover option~~~~

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

	// ~~~~end cover option~~~~

	for (let i = 0; i < imgFiles.length; i += 2) {
		const image1 = `${inputDir}/${imgFiles[i]}`;
		const image2 = i + 1 < imgFiles.length ? `${inputDir}/${imgFiles[i + 1]}` : null;

		// add new page
		if (i != 0) pdf.addPage();

		if (image1) {
			pdf.image(image1, 70, 40, { width: imgWidth, height: imgHeight });
			pdf.rect(70, 40, imgWidth, imgHeight).lineWidth(8).stroke("#EEE");
		}

		if (image2) {
			pdf.image(image2, 70, 400, { width: imgWidth, height: imgHeight });
			pdf.rect(70, 400, imgWidth, imgHeight).stroke("#EEE");
		}

		// add footer counter
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
		const files = await getFilesInDirectory(__dirname);
		displayFiles(files);

		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
		fileName = await chooseFile(rl, files);

		await pdf2png(fileName);

		// setTimeout não é a melhor abordagem, mas a biblioteca usada para conversão nao funcionamuito bem com async/await e promises
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const imgFiles = await getImgFiles(outputImgDir);

		const outputPdfDir = `${__dirname}/outputPDFs`;
		await img2pdf(imgFiles, outputImgDir, outputPdfDir);

		console.log("Conversão finalizada.");
	} catch (err) {
		console.error(err);
	}
}

main();
