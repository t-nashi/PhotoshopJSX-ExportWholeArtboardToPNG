#target photoshop
app.bringToFront();		// アプリケーション(photoshop)を最善面に持ってくる

/* ----------------------------------------------------------------------------------------------
 * PhotoshopJSX-ExportWholeArtboardToPNG
 * ----------
 * Author: Tsutomu Takanashi
 * Copyright (c) 2018 Tsutomu Takanashi
 * 
 * Project home:
 * 	https://github.com/t-nashi/PhotoshopJSX-ExportWholeArtboardToPNG
 * 
 * This software is released under the MIT License:
 * 	https://opensource.org/licenses/mit-license.php
 * ---------------------------------------------------------------------------------------------- */

//-------------------------------------------------------------
// GENERAL SETTING
//-------------------------------------------------------------
// 実行スクリプトファイルの情報取得
var _script			= $.fileName;															// スクリプトファイルのフルパス取得
var _root	 		= _script.substring(0, (_script.lastIndexOf("/")+1));					// スクリプトファイルまでのパス取得
var _scriptName		= _script.substring((_script.lastIndexOf("/")+1), _script.length);		// スクリプトファイル名取得

//読み込む対象のファイルを選定するための設定
var dir			= new Folder(_root);		//ファイル読み込み元のフォルダパス
var extention	= ".psd";					//拡張子

// アクティブドキュメント設定
var _doc;

// init処理で利用する値
var setFontSize = 24;					// アートボード名を表記するフォントサイズ
var setFontColor = "#ffffff";			// フォントの色
var posYtop = -40;						// テキストをアートボードレイヤーの上部に位置付かせるためのマイナス値
var addCanvasSizeW = 200;				// キャンバスサイズ変更時、widthにプラスする値
var addCanvasSizeH = 200;				// キャンバスサイズ変更時、heightにプラスする値
var setBackgroundColor = "#282828";		// アートボード下に敷く背景レイヤー色

var setFontColorR = parseInt(setFontColor.substring(1,3), 16);
var setFontColorG = parseInt(setFontColor.substring(3,5), 16);
var setFontColorB = parseInt(setFontColor.substring(5,7), 16);

var setBackgroundColorR = parseInt(setBackgroundColor.substring(1,3), 16);
var setBackgroundColorG = parseInt(setBackgroundColor.substring(3,5), 16);
var setBackgroundColorB = parseInt(setBackgroundColor.substring(5,7), 16);

// photoshop設定
preferences.rulerUnits = Units.PIXELS;	// 単位をpxに設定



// 開いてるドキュメントがあれば処理開始
try{
	if(documents.length !== 0){
		_doc = app.activeDocument;

		//※※ 処理実行トリガー ※※※
		run();

		//処理が全て完了したら「finish!!!」と表示
		alert("finish!!!");
	}else{
		throw new Error(errMsg = "open Artboard data document, please.");
	}
}catch(e){
	alert(e && e.message ? e.line+": "+e.message : e.line+": "+errMsg);
}



//-------------------------------------------------------------
// RUN (INITIALIZE | CONSTRUCT)
//-------------------------------------------------------------
function run(){

	// レイヤー数取得
	var ChildLyaers = _doc.layers;

	// アートボードを全てただのレイヤーにする
	for(var i=0; i<ChildLyaers.length; i++){
		var _activeLayer = _doc.layers[i];

		// レイヤーの種類や数で処理を変える
		if(_activeLayer.typename == "LayerSet" && 1 <= _activeLayer.layers.length){
			_activeLayer.merge();
		}else if(_activeLayer.typename == "LayerSet"){
			smartSet();			// スマートオブジェクト化
			rasterizeLayer();	// レイヤーをラスタライズする
		}
	}

	// 余白トリミング
	_doc.trim(TrimType.TRANSPARENT, true, true, true, true);

	var layerCount = ChildLyaers.length;		// レイヤー数カウント
	var setLayerNumber = 0;						// 処理対象のレイヤー番号をセットするための入れ物
	var addNumVal = 0;							// レイヤー指定のための調整値

	// レイヤー名を取得してテキストレイヤーに起こしていく
	for(var i=0; i<layerCount; i++){

		// 初めは処理しない
		if(i!==0) setLayerNumber=i+addNumVal;

		// テキストレイヤー追加
		_doc.suspendHistory("Add TextLayer", "addTextLayer(setLayerNumber)");

		addNumVal++;
	}


	var maxLayerCount = layerCount*2-1;			// この時点でのレイヤーの合計数

	// レイヤー名を所定の位置へ移動
	for(var i=0; i<layerCount; i++){
		translateLayerAbsolutePosition(i, getLayerPositionX(maxLayerCount), getLayerPositionY(maxLayerCount)+posYtop);
		maxLayerCount--;
	}


	// canvasサイズの変更
	_doc.resizeCanvas(_doc.width+addCanvasSizeW, _doc.height+addCanvasSizeH, AnchorPosition.MIDDLECENTER);

	// レイヤー追加
	_doc.artLayers.add();
	_doc.activeLayer.name = "Background";

	// レイヤー塗りつぶし
	var myColor = new SolidColor();
	myColor.rgb.red = myColor.rgb.green = myColor.rgb.blue = 0;
	myColor.rgb.red = setBackgroundColorR;
	myColor.rgb.green = setBackgroundColorG;
	myColor.rgb.blue = setBackgroundColorB;
	app.activeDocument.selection.selectAll();			// 全てを選択する
	app.activeDocument.selection.fill(myColor, ColorBlendMode.NORMAL, 100, false);			// 塗りつぶし
	app.activeDocument.selection.deselect();			// 選択範囲の解除

	// レイヤーを最背面へ移動
	sendToBackEnd();

	// jpg書き出し
	// jpgExport_fullPath(_root, _doc.name, 100);

	// png書き出し
	png24Export_fullPath(_root, _doc.name);


	//ファイルを別名保存
	var _docFileName = (separateFileName(_doc.name)).filename;	// 現在のドキュメントのファイル名
	var _docFileExt = (separateFileName(_doc.name)).ext;		// 現在のドキュメントの拡張子
	var saveFile = _root + _docFileName + "_Export." + _docFileExt;	// extention
	fileObj = new File(saveFile);
	saveAsFile(fileObj, _doc);


	// ドキュメントのヒストリーを一番最初に戻す
	reset();

}//run




//-------------------------------------------------------------
// ファイルの別名保存（保存ファイルパス, ターゲットドキュメント）
//-------------------------------------------------------------
function saveAsFile(saveFile, targetDoc){
	var fileObj = new File(saveFile);
	//psdファイル保存の設定
	var psdOpt = new PhotoshopSaveOptions();
	psdOpt.alphaChannels = true;
	psdOpt.annotations = true;
	psdOpt.embedColorProfile = false;
	psdOpt.layers = true;
	psdOpt.spotColors = false;
	targetDoc.saveAs(fileObj, psdOpt, true, Extension.LOWERCASE);
}//saveAsFile


//-------------------------------------------------------------
// ファイル名と拡張子を分けて変数に当てはめて値を返す（呼び出し側で変数の指定が必要）例：x['filename'] or x['ext']
//-------------------------------------------------------------
function separateFileName(theFileName){
	if (/\.\w+$/.test(theFileName)) {
		var m = theFileName.match(/([^\/\\]+)\.(\w+)$/);
		if (m)
			return {filename: m[1], ext: m[2]};
		else
			return {filename: 'no file name', ext:null};
	} else {
		var m = theFileName.match(/([^\/\\]+)$/);
		if (m)
			return {filename: m[1], ext: null};
		else
			return {filename: 'no file name', ext:null};
	}
}//separateFileName


//-------------------------------------------------------------
// テキストレイヤー追加
//-------------------------------------------------------------
function addTextLayer(n){

	var layerName = _doc.layers[n].name;

	layers = _doc.artLayers;
	var newLayer = layers.add();
	newLayer.kind = LayerKind.TEXT;

	newLayer.textItem.contents = layerName;							// テキストレイヤーの中身をセット
	newLayer.textItem.size = setFontSize;							// フォントサイズ
	// newLayer.textItem.font = "TelopMinPro-E";					// フォントの種類
	newLayer.textItem.justification = Justification.LEFT;			// 左寄せ
	newLayer.textItem.color.rgb.red = setFontColorR;
	newLayer.textItem.color.rgb.green = setFontColorG;
	newLayer.textItem.color.rgb.blue = setFontColorB;
	// newLayer.textItem.horizontalScale = 90;						// 水平比率
}


//-------------------------------------------------------------
// レイヤー移動
//-------------------------------------------------------------
function translateLayerAbsolutePosition(layerName, moveX, moveY){
	var targetLayer = activeDocument.layers[layerName];
	targetLayerBounds = targetLayer.bounds;
	resetX = parseInt(targetLayerBounds[0]) * -1;
	resetY = parseInt(targetLayerBounds[1]) * -1;
	targetLayer.translate(resetX , resetY);
	targetLayer.translate(moveX, moveY);
}


//-------------------------------------------------------------
// 選択中のレイヤーのX値を返す
//-------------------------------------------------------------
function getLayerPositionX(layerName){
	var targetLayer = activeDocument.layers[layerName];
	targetLayerBounds = targetLayer.bounds;
	resetX = parseInt(targetLayerBounds[0]);
	resetY = parseInt(targetLayerBounds[1]);
	return resetX;
}

//-------------------------------------------------------------
// 選択中のレイヤーのY値を返す
//-------------------------------------------------------------
function getLayerPositionY(layerName){
	var targetLayer = activeDocument.layers[layerName];
	targetLayerBounds = targetLayer.bounds;
	resetX = parseInt(targetLayerBounds[0]);
	resetY = parseInt(targetLayerBounds[1]);
	return resetY;
}

//-------------------------------------------------------------
// アクティブレイヤーを最背面へ移動する
//-------------------------------------------------------------
function sendToBackEnd(){
	var id192 = charIDToTypeID( "move" );
		var desc46 = new ActionDescriptor();
		var id193 = charIDToTypeID( "null" );
			var ref27 = new ActionReference();
			var id194 = charIDToTypeID( "Lyr " );
			var id195 = charIDToTypeID( "Ordn" );
			var id196 = charIDToTypeID( "Trgt" );
			ref27.putEnumerated( id194, id195, id196 );
		desc46.putReference( id193, ref27 );
		var id197 = charIDToTypeID( "T   " );
			var ref28 = new ActionReference();
			var id198 = charIDToTypeID( "Lyr " );
			var id199 = charIDToTypeID( "Ordn" );
			var id200 = charIDToTypeID( "Back" );
			ref28.putEnumerated( id198, id199, id200 );
		desc46.putReference( id197, ref28 );
	executeAction( id192, desc46, DialogModes.NO );
}


//-------------------------------------------------------------
// Web用に保存する（JPEG）--- Exif情報を含まない状態で書き出す	※fullPath
//-------------------------------------------------------------
function jpgExport_fullPath(fullPath, fileName, qualityVal){
	var doc = app.activeDocument;														//アクティブドキュメントの定義
	doc.changeMode(ChangeMode.RGB);													//イメージのモードをRGBへ変更

	//doc.bitsPerChannel = BitsPerChannelType.EIGHT;								//カラーチャンネルを8bitにする。JPEGのmaxは24bit。8bit*RGBの3チャンネルで24bit

	var options = new ExportOptionsSaveForWeb();									//Web用に保存用の設定をする
	options.quality = qualityVal;													//画質（0〜100 デフォルトは60 大きいほど高品質）
	options.format = SaveDocumentType.JPEG;											//画像の形式 -> COMPUSERVEGIF, JPEG, PNG-8, PNG-24, BMP の指定が可能
	options.optimized = false;														//最適化するか
	options.interlaced = false;														//インターレースにするか（プログレッシブJPGにするか）

	var ext = '.jpg'
	var saveName = new File(fullPath + fileName + ext);		//フォルダパスを含めたファイル名をセット

	doc.exportDocument(saveName, ExportType.SAVEFORWEB, options);
}//jpgExport_fullPath


//-------------------------------------------------------------
// Web用に保存する（png24）	※fullPath
//-------------------------------------------------------------
function png24Export_fullPath(fullPath, fileName){
	var doc = app.activeDocument;														//アクティブドキュメントの定義
	pngOpt = new PNGSaveOptions();
	pngOpt.interlaced = false;
	var ext = '.png'
	var saveName = new File(fullPath + fileName + ext);		//フォルダパスを含めたファイル名をセット

	doc.saveAs(saveName, pngOpt, true, Extension.LOWERCASE);
}

//-------------------------------------------------------------
// ドキュメントのヒストリーを一番最初に戻す
//-------------------------------------------------------------
function reset(){
	var idRvrt = charIDToTypeID( "Rvrt" );
	executeAction( idRvrt, undefined, DialogModes.NO );
}

//-------------------------------------------------------------
// スマートオブジェクト化
//-------------------------------------------------------------
function smartSet(){
	var idx = stringIDToTypeID( "newPlacedLayer" );
	executeAction( idx, undefined, DialogModes.NO );
}

//-------------------------------------------------------------
// レイヤーをラスタライズする
//-------------------------------------------------------------
function rasterizeLayer(){
	var id774 = stringIDToTypeID( "rasterizeLayer" );
		var desc179 = new ActionDescriptor();
		var id775 = charIDToTypeID( "null" );
			var ref68 = new ActionReference();
			var id776 = charIDToTypeID( "Lyr " );
			var id777 = charIDToTypeID( "Ordn" );
			var id778 = charIDToTypeID( "Trgt" );
			ref68.putEnumerated( id776, id777, id778 );
		desc179.putReference( id775, ref68 );
	executeAction( id774, desc179, DialogModes.NO );
}
