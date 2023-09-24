const fs = require("fs");
const pdfkit = require("pdfkit");

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

function png2pdf(imgFiles, inputDir, outputPath) {
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

	pdf.pipe(fs.createWriteStream(outputPath));
	pdf.end();
}

let outputImgDir = `${__dirname}/outputPNGs/teste`;

async function main() {
	try {
		const imgFiles = await getImgFiles(outputImgDir);
		png2pdf(imgFiles, outputImgDir, "output.pdf");
	} catch (err) {
		console.error(err)
	}
}

main();
