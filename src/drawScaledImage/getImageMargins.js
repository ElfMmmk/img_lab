export default function getImageMargins(conWidth, conHeight, imageWidth, imageHeight, firstLoad) {
    let marginLeft = 0;
    let marginTop = 0;
    
    if (firstLoad) {
        marginLeft = Math.round(Math.max((conWidth - imageWidth) / 2, 50));
        marginTop = Math.round(Math.max((conHeight - imageHeight) / 2, 50));
    } else {
        if (conWidth > imageWidth) {
            marginLeft = Math.round((conWidth - imageWidth) / 2);
        } else {
            marginLeft = 0;
        }

        if (conHeight > imageHeight) {
            marginTop = Math.round((conHeight - imageHeight) / 2);
        } else {
            marginTop = 0;
        }
    }

    return {
        left: marginLeft,
        top: marginTop
    }
}
