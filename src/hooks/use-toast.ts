import { useToast as useVueToast } from "vue-toastification";
import "vue-toastification/dist/index.css";
import { h } from "vue";

export function useToast() {
  const toast = useVueToast();

  return {
    toast: ({
      title,
      description,
      variant = "default",
    }: {
      title: string;
      description?: string;
      variant?: "default" | "success" | "destructive" | "info";
    }) => {
      toast(
        {
          render: () =>
            h(
              "div",
              { class: `shadcn-toast ${variant}` }, // 👈 SAME CLASS LIKE REACT
              [
                h("div", { class: "toast-title" }, title),
                description
                  ? h("div", { class: "toast-description" }, description)
                  : null,
              ]
            ),
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
