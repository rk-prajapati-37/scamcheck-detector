import { useRef, useEffect } from "react";

const useDragScroll = () => {
  const ref = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // ✅ Horizontal mouse wheel scroll
    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    // Mouse drag scroll (desktop only)
    const handleMouseDown = (e) => {
      if (e.target.tagName === 'BUTTON') return;
      isDragging.current = true;
      el.classList.add("dragging");
      startX.current = e.pageX - el.offsetLeft;
      scrollLeft.current = el.scrollLeft;
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX.current) * 2;
      el.scrollLeft = scrollLeft.current - walk;
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      el.classList.remove("dragging");
    };

    const handleMouseLeave = () => {
      isDragging.current = false;
      el.classList.remove("dragging");
    };

    // Add event listeners
    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("mousedown", handleMouseDown);
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseup", handleMouseUp);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("mousedown", handleMouseDown);
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseup", handleMouseUp);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return ref;
};

export default useDragScroll;
