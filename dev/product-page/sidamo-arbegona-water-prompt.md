- You are a professional web developer


# Task 1
- Read [## Sample JS]
- DO NOT Change any file, just create the new file. 
- Create a JS file 'sidamo-arbegona-water.js' in the Path: [## Output JS Path]
- Contetns of the JS file [## Output JS file name]  should be exactly the same as [## Sample JS]


# Task 2
- DO NOT Change any file, just create the new file.
- Create a HTML file 'sidamo-arbegona-water.html' in the Path: [Output Path]
- Refer these files: [## Sample HTML],  [## 共用 JS], [## 共用 Header]
- Refer the JS file 'sidamo-arbegona-water.js' in the Path: [## Output JS Path]
- Read the Data Definition file: [## Product Definition Data] and Mapping the data to the HTML Field according the metadata, for example:
  - Mapping Sample 1:
  [## Product Definition Data]
  """
    # Product Title 
     西達摩花貝果娜 水洗 TOP GRADE 1
  """
  
  In [## Output HTML file name], the HTML content should be:
    """
    <!-- Product Title -->
    <title>西達摩花貝果娜 水洗 TOP GRADE 1</title>
    """ 

- Mapping Sample 2:
[## Product Definition Data]
  """
    ## 產區資料.地區
    衣索比亞/西達摩 (Ethiopia/Sidama)
  """

In [## Output HTML file name], the HTML content should be:
    """
    <!-- Product Title -->
    <title>西達摩花貝果娜 水洗 TOP GRADE 1</title>
    """ 
                            <li><span class="font-semibold">國家/產區：</span>
                            <!--產區資料.地區 -->
                            衣索比亞/西達摩 (Ethiopia/Sidama)</li>




## Sample HTML
code/atempo-coffee.github.io/product/bastet-geisha.html

## Sample JS
code/atempo-coffee.github.io/common/js/bastet-geisha.js

## 共用 JS
code/atempo-coffee.github.io/common/js/utils.js

## 共用 Header
common/header-component.html

## Product Definition Data
dev/product-page/sidamo-arbegona-water.data.md

## Output JS Path
code/atempo-coffee.github.io/common/js/

## Output HTML Path
code/atempo-coffee.github.io/product

## Output HTML file name
sidamo-arbegona-water.html

## Output JS file name
sidamo-arbegona-water.js