import eyedropper from "./eyedropper/eyedropper";
import hand from "./hand/hand";
import colorCorrection from "./colorCorrection/colorCorrection";
import filter from "./filter/filter";

export default function activeTools() {
    eyedropper();
    hand();
    colorCorrection();
    filter();
}
