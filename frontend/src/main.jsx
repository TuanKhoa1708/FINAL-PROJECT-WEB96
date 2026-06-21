import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ConfigProvider } from "antd";
import { ToastProvider } from "./components/ToastContext";

import "antd/dist/reset.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1E40AF",
          colorSuccess: "#22C55E",
          colorInfo: "#0EA5E9",
          colorWarning: "#F59E0B",
          colorError: "#EF4444",
          colorTextBase: "#0F172A",
          borderRadius: 10,
          fontFamily: "'Inter', 'Poppins', sans-serif",
          fontSize: 14,
          colorBgContainer: "#FFFFFF",
          colorBorderSecondary: "rgba(0,0,0,0.06)",
        },
        components: {
          Card: {
            boxShadowTertiary: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)",
            borderRadius: 12,
          },
          Table: {
            headerBg: "#F8FAFC",
            headerColor: "#64748B",
            rowHoverBg: "#F8FAFF",
            borderRadius: 12,
            headerSplitColor: "transparent",
            fontSize: 14,
          },
          Button: {
            controlHeight: 40,
            borderRadius: 8,
            fontWeight: 500,
          },
          Input: {
            borderRadius: 8,
            controlHeight: 40,
          },
          Select: {
            borderRadius: 8,
            controlHeight: 40,
          },
          Modal: {
            borderRadius: 16,
          },
          Menu: {
            itemBorderRadius: 8,
            itemMarginInline: 8,
            subMenuItemBorderRadius: 8,
          },
          Tag: {
            borderRadius: 6,
          },
        }
      }}
    >
      <ToastProvider>
        <App />
      </ToastProvider>
    </ConfigProvider>
  </React.StrictMode>
);