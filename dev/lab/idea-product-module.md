
## Sample HTML
code/atempo-coffee.github.io/product/bastet-geisha.html

## HTML Parameter Block
-block 1
    <!-- Product Title -->
    <title>古吉罕貝拉 芭絲特藝妓 日曬 TOP G1 - 咖啡豆</title>

-block 2
    <div class="md:w-1/2 flex justify-center items-start">
                    <!-- 商品圖片 src and alt-->
                    <img 
                        src="/icon/bastet-geisha/bastet-geisha-600x800-1.png" 
                        alt="古吉罕貝拉 芭絲特藝妓 日曬 TOP G1 咖啡豆" 

-block 3
    <h2 class="text-4xl lg:text-5xl font-extrabold mb-3 leading-tight text-gray-900">
                 <!--  品名.大標-->
                        <br>芭絲特藝妓
                    </h2>
                         <!--  品名.小標-->
                    <p class="text-2xl font-light text-gray-600 border-b pb-4 mb-4">
                        日曬 TOP G1 (Geisha)
                    </p>
-block 4
 <!-- 品項規格-->
                    <div class="flex flex-wrap gap-2 mb-6">
                        <!-- 品項規格.tag1-->
                        <span class="tag-style" style="background-color: var(--color-primary);">TOP G1</span>
                        <!-- 品項規格.tag2-->
                        <span class="tag-style" style="background-color: var(--color-secondary);">藝妓品種</span>
                        <!-- 品項規格.tag3-->
                        <span class="tag-style" style="background-color: #ef4444;">日曬處理</span>
                        <!-- 品項規格.tag4-->
                        <span class="tag-style" style="background-color: #3b82f6;">衣索比亞古吉</span>
                    </div>

-block 5
  <!--價格資訊-->
                    <div class="mb-8">
                        <!--價格資訊.原價 -->
                        <p class="text-2xl price-original">原價: TWD 580 / 半磅</p>
                        <!--價格資訊.特價 -->
                        <p class="text-3xl price-special flex items-baseline gap-2 mt-2">
                            特價: <span>TWD 380</span>
                        <!--價格資訊.規格 -->
                        <span class="text-lg text-red-500 font-normal"> / 半磅 (約 227g)</span>
                        </p>
                    </div>

-block 6
<!--產區資料 -->
                <div class="grid md:grid-cols-2 gap-8 text-lg">
                    <div>
                        <h4 class="text-xl font-bold mb-2 text-gray-700">產區資訊 (Provenance)</h4>
                        <ul class="list-disc pl-5 space-y-2 text-gray-600">
                            <li><span class="font-semibold">國家/產區：</span>
                            <!--產區資料.地區 -->
                            衣索比亞 (Ethiopia) / 古吉 (Guji) / 罕貝拉 (Hambella)</li>
                            <li><span class="font-semibold">海拔：</span>
                            <!--產區資料.海拔 -->
                            約 2520 masl</li>                            
                            <li><span class="font-semibold">品種：</span>
                            <!--產區資料.品種 -->
                            藝妓 (Geisha)</li>
                            <li><span class="font-semibold">處理法：</span>
                            <!--產區資料.處理法 -->    
                            日曬</li>
                        </ul>
                    </div>

- block 7
<div>
                        <!--風味筆記-->
                        <h4 class="text-xl font-bold mb-2 text-gray-700">風味筆記</h4>
                        <div class="flex flex-wrap gap-2 mb-4">
                            <!--風味筆記.tag1-->
                            <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">梔子花香</span>
                            <!--風味筆記.tag2-->
                            <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">夜來香</span>
                            <!--風味筆記.tag3-->
                            <span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">甜梨、蘋果甜感</span>
                            <!--風味筆記.tag4-->
                            <span class="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">百香果</span>
                        </div>
                           <!--風味筆記.desc1-->
                           <p class="text-gray-600">
                            這款藝妓展現出豐富的層次感。入口有著日曬豆奔放的花香調性，隨之紮實的BODY有著百香果、甜梨甜感、伴隨些許蘋果味，令人印象深刻。
                        </p>
                        <!--風味筆記.desc2-->
                        <p class="text-gray-600">
                            沖煮上建議減少悶蒸，以追求乾淨度為方向。
                        </p>
                    </div>

                    <!--關鍵參數.豆量-->
                            <div class="text-3xl font-bold text-amber-800">16g</div>

                    <!--關鍵參數.水量-->
                            <div class="text-3xl font-bold text-amber-800">230 - 240ml</div>

## 參數化檔案範本
/code/atempo-coffee.github.io/dev/lab/product-metadata-sample.md

## 想要達成的功能
- 將商品資料定義在 product-metadata-sample.md
- 讓商品 HTML [HTML Parameter Block]，可以讀取定義檔，顯示商品資料，網頁格式保持不變

## 測試輸出
- 不要修改[Sample HTML]
- 測試檔案路徑：code/atempo-coffee.github.io/dev/lab/lab-product-1.html
- 除了新增測試檔案，確保不修改 Repository 中的任何檔案
