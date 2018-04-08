# PhotoshopJSX-ExportWholeArtboardToPNG

このプログラムは [Adobe Photoshop](http://www.adobe.com/jp/products/photoshop.html) で動作する JavaScript(JSX) です。
スクリプトを実行する事前準備として、Photoshopで第一階層が全てアートボードレイヤー状態のドキュメントを開いてアクティブな状態にしておきます。
その状態で実行するとJSXファイルと同階層にアートボードを名前付きでレイヤー配置した psd と png を出力します。
（アートボードをそのままWeb用に保存をするとアートボード名が分からないのとアートボード間の隙間や背景色が調整できない部分を緩和するために本スクリプトを作成しました）

▽動作確認済み
* Adobe Photoshop CC 2018 （Windows10、macOS High Sierra(v10.13.3)）

## 解説サイト

...準備中...


## 注意 （Cautionn）

* 本プログラムご使用は自己責任でお願いいたします


## インストール （Installation）

1. このページの `Clone or download` ボタンよりリポジトリのクローンもしくはZIPダウンロードをします。
2. ZIPダウンロードの場合は解凍をします。
3. 解凍して出来たフォルダの中に「`ExportWholeArtboardToPNG.jsx`」があれば完了です。


## 使用法 （Usage）

* 「`ExportWholeArtboardToPNG.jsx`」をダブルクリックか Photoshop 内へドラッグ＆ドロップして実行
（Photoshop上で第一階層が全てアートボードレイヤーのドキュメントがアクティブになった状態で）

JSXファイルと一緒に「`ArtboardSample.psd`」がありますのでサンプルファイルとしてご活用ください。
JSXファイルと同階層に実行時の日時の psd ファイルと png ファイルが出力されれば成功です。


## 仕様 (Specification)

* `ExportWholeArtboardToPNG.jsx` がメインの実行ファイル
* アクティブドキュメント内のアートボードレイヤーを統合し、それらの名前のテキストレイヤーを配置、canvasサイズを広げて背景レイヤーが敷かれる
* 各レイヤー上部へ作成されるテキストの色・サイズ、最下部に配置する背景レイヤーの色等はスクリプト内で調整可能
* 処理が成功するとJSXファイルと同階層に実行日時名の psd と png(24bit) ファイルが出力される


## コピーライト （Copyright）
Copyright © 2018+ Tsutomu Takanashi. See LICENSE for details.
