<script lang="ts">
	import Autocomplete from "@smui-extra/autocomplete";
	import Textfield from "@smui/textfield";

	let xDivImageSize: number | null = null;
	let yDivImageSize: number | null = null;
	let xDivPhysicalScale: number;
	let xDivPhysicalUnit: string;
	let yDivPhysicalScale: number;
	let yDivPhysicalUnit: string;

	$: console.log(xDivPhysicalUnit + " set");

	let canvas: HTMLCanvasElement;
	let image: HTMLImageElement;

	let imageSet = true; // false;
	let divisionsSet = false;

	const siPrefixes = [
		"p",
		"n",
		"u",
		"µ",
		"m",
		"",
		"k",
		"M",
		"G",
		"T",
		"P",
		"E",
		"Z",
		"Y",
	];
	const siUnits = ["V", "A", "C", "W", "K", "°C"];

	const suggestedUnits = siPrefixes
		.map((prefix) =>
			siUnits.map((unit) => ({
				prefix: prefix,
				unit: unit,
			}))
		)
		.flat();

	function render() {
		const ctx = canvas.getContext("2d")!;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
	}

	function uploadFile(file: File) {
		image = new Image();

		const reader = new FileReader();
		reader.onload = () => {
			image.src = reader.result as string;
			image.onload = () => {
				imageSet = true;
				render();
			};
		};
		reader.readAsDataURL(file);
	}

	function dropHandler(event: DragEvent) {
		event.preventDefault();
		const file = (event.dataTransfer!.files as FileList)[0];
		uploadFile(file);
	}

	function clickToUploadHandler(event: MouseEvent) {
		const fileInput = document.createElement("input");
		fileInput.type = "file";
		fileInput.onchange = () => {
			const file = (fileInput.files as FileList)[0];
			uploadFile(file);
		};
		fileInput.click();
	}

	function dragEnterHandler(event: DragEvent) {
		event.preventDefault();
	}
</script>

<div id="scope-box">
	<canvas bind:this={canvas} height={image?.height} width={image?.width} />
	<div
		id="drop-zone"
		on:dragenter={dragEnterHandler}
		on:drop={dropHandler}
		on:click={clickToUploadHandler}
		class={imageSet ? "hidden" : ""}
	/>
	<div id="div-setup-overlay">
		<h2>Set your division</h2>
		<Textfield
			type="number"
			input$step="1"
			label="x division (px)"
			value={xDivImageSize}
		/>
		x
		<Textfield
			type="number"
			input$step="1"
			label="y division (px)"
			value={yDivImageSize}
		/>
		<br />
		<Textfield
			type="number"
			input$step="1"
			label="x scale"
			value={xDivImageSize}
		/>
		<Autocomplete
			combobox
			options={suggestedUnits}
			getOptionLabel={(option) =>
				option ? `${option.prefix}${option.unit}` : ""}
			bind:value={xDivPhysicalUnit}
			label="unit"
		/>
	</div>
</div>

<style>
	#scope-box {
		position: relative;
		min-width: 600px;
		min-height: 300px;
		background-color: var(--secondary-color);
	}

	#drop-zone {
		display: flex;
		align-items: center;
		justify-content: center;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		border: 2px dashed var(--primary-color);
		border-radius: 5px;
		text-align: center;
		font-size: 1em;
		cursor: pointer;
		color: var(--primary-color);
	}

	#drop-zone.hidden {
		visibility: hidden;
	}

	#drop-zone:hover {
		border-color: var(--primary-color);
	}

	#drop-zone::after {
		content: "Drop an image here on click to select";
	}

	#div-setup-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		font-size: 1em;
	}
</style>
