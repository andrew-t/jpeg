document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('reset').addEventListener('click', readFile);
	document.getElementById('file').addEventListener('change', readFile);
	document.getElementById('iterate').addEventListener('click', iterate);
	document.getElementById('loop').addEventListener('click', 
		() => loop(
			document.getElementById('loop-count').value,
			document.getElementById('loop-delay').value));
	document.getElementById('save').addEventListener('click', () => {
		const link = document.createElement("a");
		link.download = 'garbage.jpeg';
		link.href = document.getElementById('image').src;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	});
	document.getElementById('advanced').addEventListener('change', advanced);
	advanced();
	readFile();
});

function advanced() {
	document.body.classList[document.getElementById('advanced').checked ? 'add' : 'remove']('advanced');
}

async function loop(n, d) {
	while (n --> 0) {
		iterate();
		await delay(d, 0);
	}
}

function iterate() {
	imageToCanvas();
	contrast();
	canvasToImage();
}

function canvasToImage() {
	const maxQuality = parseFloat(document.getElementById('max-quality').value),
		minQuality = parseFloat(document.getElementById('min-quality').value),
		quality = Math.random() * (maxQuality - minQuality) + minQuality;
	document.getElementById('image').src =
		document.getElementById('source').toDataURL('image/jpeg', quality); 
}

function imageToCanvas() {
	const canvas = document.getElementById('source'),
		context = canvas.getContext('2d'),
		image = document.getElementById('image'),
		maxScale = parseFloat(document.getElementById('max-scale').value),
		minScale = parseFloat(document.getElementById('min-scale').value),
		scale = Math.random() * (maxScale - minScale) + minScale,
		border = ~~Math.max(-3, Math.random() * 50 - 35);
	context.fillStyle = Math.random() > 0.5 ? 'black' : 'white';
	context.fillRect(0, 0, canvas.width, canvas.height);
	canvas.width = parseFloat(image.style.width) * scale + border * 2;
	canvas.height = parseFloat(image.style.height) * scale + border * 2;
	context.drawImage(
		image,
		border,
		border,
		canvas.width - border * 2,
		canvas.height - border * 2);
}

function contrast() {
	const canvas = document.getElementById('source'),
		context = canvas.getContext('2d'),
		maxContrast = parseFloat(document.getElementById('max-contrast').value),
		minContrast = parseFloat(document.getElementById('min-contrast').value),
		contrast = Math.random() * (maxContrast - minContrast) + minContrast,
		maxBrightness = parseFloat(document.getElementById('max-brightness').value),
		minBrightness = parseFloat(document.getElementById('min-brightness').value),
		brightness = Math.random() * (maxBrightness - minBrightness) + minBrightness,
		imageData = context.getImageData(0, 0, canvas.width, canvas.height);
	for (let i = 0; i < imageData.data.length; ++i)
		if (i % 4 != 3)
			imageData.data[i] = imageData.data[i] * contrast + brightness;
	context.putImageData(imageData, 0, 0);
}

function delay(n) {
	return new Promise(resolve => setTimeout(resolve, n));
}

async function readFile() {
	const file = document.getElementById('file').files[0],
		reader = file.stream().getReader(),
		sImage = new Image();
	const img = [];
	while (true) {
		const { value, done } = await reader.read();
		if (value) img.push(value);
		if (done) {
			const image = document.getElementById('image');
			sImage.onload = () => {
				const scale = Math.min(1,
					(window.innerWidth - 50) / sImage.width,
					(window.innerHeight - 300) / sImage.height);
				image.style.width = `${sImage.width * scale}px`;
				image.style.height = `${sImage.height * scale}px`;
			};
			sImage.src = image.src = `data:${file.type};base64,${bufferToBase64(img)}`;
			break;
		}
	}
}

function bufferToBase64(buf) {
    return btoa(buf.map(b => [].map.call(b, c => String.fromCharCode(c)).join('')).join(''));
}
