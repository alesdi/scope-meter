<script lang="ts">
	import { scopeSetup } from "$lib/../store";
	import Autocomplete from "@smui-extra/autocomplete";
	import Button, { Icon, Label } from "@smui/button";
	import Card, { Content } from "@smui/card";
	import Textfield from "@smui/textfield";
	import { onMount } from "svelte";
	import {
		ScopeBoxImagePickState,
		ScopeBoxRunState,
		ScopeBoxState,
	} from "./ScopeBoxState";

	let xDivImageSize: number | null = null;
	let yDivImageSize: number | null = null;
	let xDivPhysicalScale: number | null = null;
	let xDivPhysicalUnit: string | null = "";
	let yDivPhysicalScale: number | null = null;
	let yDivPhysicalUnit: string | null = "";

	scopeSetup.subscribe((value) => {
		console.log("scopeSetup loaded");
		console.log(value);
		if (value != null) {
			xDivImageSize = value.xDivImageSize ?? null;
			yDivImageSize = value.yDivImageSize ?? null;
			xDivPhysicalScale = value.xDivPhysicalScale ?? null;
			xDivPhysicalUnit = value.xDivPhysicalUnit ?? null;
			yDivPhysicalScale = value.yDivPhysicalScale ?? null;
			yDivPhysicalUnit = value.yDivPhysicalUnit ?? null;
		}
	});

	$: scopeSetup.set({
		xDivImageSize: xDivImageSize,
		yDivImageSize: yDivImageSize,
		xDivPhysicalScale: xDivPhysicalScale,
		xDivPhysicalUnit: xDivPhysicalUnit,
		yDivPhysicalScale: yDivPhysicalScale,
		yDivPhysicalUnit: yDivPhysicalUnit,
	});

	$: if (state) {
		state.xDivImageSize = xDivImageSize;
		state.yDivImageSize = yDivImageSize;
		state.xDivPhysicalScale = xDivPhysicalScale;
		state.xDivPhysicalUnit = xDivPhysicalUnit;
		state.yDivPhysicalScale = yDivPhysicalScale;
		state.yDivPhysicalUnit = yDivPhysicalUnit;
	}

	let canvas: HTMLCanvasElement;

	let state: ScopeBoxState;

	function onStateTransition(next: ScopeBoxState) {
		state = next;
	}

	async function selectDivisionRectangle() {
		(state as ScopeBoxRunState)?.selectDivisionRectangle();
	}

	function handleFileSelected(file: File) {
		if (state instanceof ScopeBoxImagePickState) {
			state.loadFile(file);
		} else if (state instanceof ScopeBoxRunState) {
			state.swapFile(file);
		}
	}

	onMount(async () => {
		state = new ScopeBoxImagePickState({
			transition: onStateTransition,
			updateDivisionSetup: ({ x, y }: { x: number; y: number }) => {
				xDivImageSize = x;
				yDivImageSize = y;
			},
			canvas: canvas,
		});
	});

	const siPrefixes = ["u", "µ", "m", "", "k", "M", "G"];
	const siXUnits = ["s", "Hz"];
	const siYUnits = ["V", "A", "C", "W", "K", "°C"];

	const autofillXUnits = siXUnits
		.map((unit) => siPrefixes.map((prefix) => prefix + unit))
		.flat();

	const autofillYUnits = siYUnits
		.map((unit) => siPrefixes.map((prefix) => prefix + unit))
		.flat();
</script>

<div id="scope-box">
	<canvas
		bind:this={canvas}
		on:mousedown={(event) => state?.handleMouseDown(event)}
		on:mousemove={(event) => state?.handleMouseMove(event)}
		on:mouseup={(event) => state?.handleMouseUp(event)}
		on:dragover={(event) => state?.dragOverHandler(event)}
		on:drop={(event) => state?.dropHandler(event)}
		on:click={() => state?.clickToUploadHandler()}
		class={state instanceof ScopeBoxImagePickState ? "button" : ""}
	/>
</div>

<div id="division-setup">
	<div class="division-setup-card">
		<Card style="height: 100%">
			<Content>
				<h2>Division setup</h2>
				<div style="display: flex; gap: 10px;">
					<Textfield
						type="number"
						input$step="1"
						label="x division (px)"
						bind:value={xDivImageSize}
						style="flex: 1"
					/>
					<Textfield
						type="number"
						input$step="1"
						label="y division (px)"
						bind:value={yDivImageSize}
						style="flex: 1"
					/>
				</div>
				<Button
					on:click={selectDivisionRectangle}
					variant="raised"
					style="width: 100%; margin-top: 1em;"
				>
					<Icon class="material-icons">cropfree</Icon>
					<Label>Select a division rectangle</Label>
				</Button>
			</Content>
		</Card>
	</div>
	<div class="division-setup-card">
		<Card style="height: 100%">
			<Content>
				<h2>Scale setup</h2>
				<div style="display: flex; gap: 10px;">
					<Textfield
						type="number"
						input$step="1"
						label="x scale"
						bind:value={xDivPhysicalScale}
						style="flex: 0.6"
					/>
					<Autocomplete
						combobox
						options={autofillXUnits}
						bind:value={xDivPhysicalUnit}
						label="x unit"
						style="flex: 0.4"
					/>
				</div>
				<div style="display: flex; gap: 10px;">
					<Textfield
						type="number"
						input$step="1"
						label="y scale"
						bind:value={yDivPhysicalScale}
						style="flex: 0.6"
					/>
					<Autocomplete
						combobox
						options={autofillYUnits}
						bind:value={yDivPhysicalUnit}
						label="y unit"
						style="flex: 0.4"
					/>
				</div>
			</Content>
		</Card>
	</div>
</div>

<style>
	#scope-box {
		position: relative;
		min-width: 600px;
		min-height: 300px;
	}

	#division-setup {
		font-size: 1em;
		display: flex;
		align-items: stretch;
		width: 100%;
		gap: 10px;
	}

	#division-setup .division-setup-card {
		flex-grow: 1;
		flex: 1;
	}

	canvas.button {
		cursor: pointer;
	}
</style>
