import { useToast as useVueToast } from "vue-toastification";
import "vue-toastification/dist/index.css";
import { h } from "vue";

export function useToast() {
  const toast = useVueToast();

  return {
    toast: ({ title, description }: { title: string; description?: string }) => {
      toast(
        {
          render: () =>
            h("div", { class: "custom-toast" }, [
              h("div", { class: "toast-title" }, title),
              description ? h("div", { class: "toast-description" }, description) : null,
            ]),
        },
        {
         
          timeout: 4000,
          hideProgressBar: true,
          closeButton: false,
          draggable: true,
        icon: false,
          toastClassName: "custom-toast-wrapper",
        }
      );
    },
  };
}
