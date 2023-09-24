const fs = require("fs");
const pdfkit = require("pdfkit");

function getImagesInDir(dir) {
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

function png2pdf(imgFiles, title, subtitle, outputPDF, inputPath) {
	const pdf = new pdfkit();
	const pageWidth = pdf.page.width; //612
	const pageHeight = pdf.page.height;

	pdf.addPage();
	const margemRect = 5;
	pdf.lineWidth(8);
	pdf
		.rect((pageWidth - 500) / 2, 100, 500, 150)
		.lineJoin("round")
		.stroke("#B6454B");
	pdf
		.rect((pageWidth - 500) / 2 + 50, 300, 400, 1)
		.lineJoin("round")
		.stroke("#B6454B");

	pdf.fontSize(24).text(" ", { align: "center" });
	pdf.fontSize(24).text(" ", { align: "center" });
	pdf.fontSize(24).text(" ", { align: "center" });
	pdf.fontSize(24).text(title, { align: "center" });
	pdf.fontSize(18).text(subtitle, { align: "center" });

	for (let i = 0; i < imgFiles.length; i += 2) {
		const image1 = `${inputPath}/${imgFiles[i]}`;
		const image2 = i + 1 < imgFiles.length ? `${inputPath}/${imgFiles[i+1]}` : null;

		pdf.addPage();

		//margem
		const margem = 7;

		if (image1) {
			pdf.rect((pageWidth - 500) / 2 - margem, 30 - margem, 841 / 1.8 + 2 * margem, 595 / 1.8 + 2 * margem).fill("#EEE");
			pdf.image(image1, (pageWidth - 500) / 2, 30, { width: 841 / 1.8, height: 595 / 1.8 });
		}

		if (image2) {
			pdf
				.rect((pageWidth - 500) / 2 - margem, pageHeight / 2 - margem, 841 / 1.8 + 2 * margem, 595 / 1.8 + 2 * margem)
				.fill("#EEE");
			pdf.image(image2, (pageWidth - 500) / 2, pageHeight / 2, { width: 841 / 1.8, height: 595 / 1.8 });
		}

		// Add page number marker
		pdf
			.fontSize(12)
			.fillColor("black")
			.text(`Page ${i / 2 + 1}`, pageWidth - 50, pageHeight - 30, { align: "right" });
	}

	pdf.pipe(fs.createWriteStream(outputPDF));
	pdf.end();
}

async function main() {
	try {
		const imgFiles = await getImagesInDir(__dirname + "/outputPNGs/teste");
		png2pdf(imgFiles, "Titulo", "Subtitulo", 'outpur.pdf', __dirname + "/outputPNGs/teste");
	} catch (err) {
		console.error(err);
	}
}
main();
