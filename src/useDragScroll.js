import { useRef, useEffect } from "react";

export default function useDragScroll() {
  const ref = useRef();

  useEffect(() => {
    const elem = ref.current;
    if (!elem) return;
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onMouseDown = e => {
      isDown = true;
      elem.classList.add("dragging");
      startX = e.pageX - elem.offsetLeft;
      scrollLeft = elem.scrollLeft;
    };
    const onMouseLeave = () => {
      isDown = false;
      elem.classList.remove("dragging");
    };
    const onMouseUp = () => {
      isDown = false;
      elem.classList.remove("dragging");
    };
    const onMouseMove = e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - elem.offsetLeft;
      const walk = (x - startX);
      elem.scrollLeft = scrollLeft - walk;
    };

    elem.addEventListener("mousedown", onMouseDown);
    elem.addEventListener("mouseleave", onMouseLeave);
    elem.addEventListener("mouseup", onMouseUp);
    elem.addEventListener("mousemove", onMouseMove);

    return () => {
      elem.removeEventListener("mousedown", onMouseDown);
      elem.removeEventListener("mouseleave", onMouseLeave);
      elem.removeEventListener("mouseup", onMouseUp);
      elem.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return ref;
}
