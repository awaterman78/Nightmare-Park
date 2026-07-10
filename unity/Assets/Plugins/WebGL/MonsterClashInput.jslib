mergeInto(LibraryManager.library, {
  MonsterClashInput_Install: function () {
    var state = window.__monsterClashInputState;
    if (!state) {
      state = {
        installed: false,
        down: false,
        up: false,
        downX: 0,
        downY: 0,
        upX: 0,
        upY: 0
      };
      window.__monsterClashInputState = state;
    }

    state.down = false;
    state.up = false;
    if (state.installed) return 1;

    var canvas = Module["canvas"];
    if (!canvas) return 0;

    state.installed = true;
    canvas.style.touchAction = "none";

    var savePoint = function (clientX, clientY, released) {
      var rect = canvas.getBoundingClientRect();
      var renderWidth = canvas.width || rect.width;
      var renderHeight = canvas.height || rect.height;
      var x = (clientX - rect.left) * renderWidth / Math.max(1, rect.width);
      var y = (rect.bottom - clientY) * renderHeight / Math.max(1, rect.height);

      x = Math.max(0, Math.min(renderWidth, x));
      y = Math.max(0, Math.min(renderHeight, y));

      if (released) {
        state.upX = x;
        state.upY = y;
        state.up = true;
      } else {
        state.downX = x;
        state.downY = y;
        state.down = true;
      }
    };

    if (window.PointerEvent) {
      canvas.addEventListener("pointerdown", function (event) {
        if (event.isPrimary === false || event.button > 0) return;
        event.preventDefault();
        if (canvas.setPointerCapture) {
          try {
            canvas.setPointerCapture(event.pointerId);
          } catch (error) {
          }
        }
        savePoint(event.clientX, event.clientY, false);
      }, { passive: false });

      canvas.addEventListener("pointerup", function (event) {
        if (event.isPrimary === false || event.button > 0) return;
        event.preventDefault();
        savePoint(event.clientX, event.clientY, true);
      }, { passive: false });
    } else {
      canvas.addEventListener("touchstart", function (event) {
        if (event.touches.length === 0) return;
        event.preventDefault();
        var touch = event.touches[0];
        savePoint(touch.clientX, touch.clientY, false);
      }, { passive: false });

      canvas.addEventListener("touchend", function (event) {
        if (event.changedTouches.length === 0) return;
        event.preventDefault();
        var touch = event.changedTouches[0];
        savePoint(touch.clientX, touch.clientY, true);
      }, { passive: false });

      canvas.addEventListener("mousedown", function (event) {
        if (event.button > 0) return;
        savePoint(event.clientX, event.clientY, false);
      });

      canvas.addEventListener("mouseup", function (event) {
        if (event.button > 0) return;
        savePoint(event.clientX, event.clientY, true);
      });
    }

    return 1;
  },

  MonsterClashInput_HasPointerDown: function () {
    var state = window.__monsterClashInputState;
    return state && state.down ? 1 : 0;
  },

  MonsterClashInput_GetPointerDownX: function () {
    var state = window.__monsterClashInputState;
    return state ? state.downX : 0;
  },

  MonsterClashInput_GetPointerDownY: function () {
    var state = window.__monsterClashInputState;
    return state ? state.downY : 0;
  },

  MonsterClashInput_ConsumePointerDown: function () {
    var state = window.__monsterClashInputState;
    if (state) state.down = false;
  },

  MonsterClashInput_HasPointerUp: function () {
    var state = window.__monsterClashInputState;
    return state && state.up ? 1 : 0;
  },

  MonsterClashInput_GetPointerUpX: function () {
    var state = window.__monsterClashInputState;
    return state ? state.upX : 0;
  },

  MonsterClashInput_GetPointerUpY: function () {
    var state = window.__monsterClashInputState;
    return state ? state.upY : 0;
  },

  MonsterClashInput_ConsumePointerUp: function () {
    var state = window.__monsterClashInputState;
    if (state) state.up = false;
  }
});
