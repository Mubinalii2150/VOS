// src/components/ComputerApp.jsx

import {
  useEffect,
  useState,
} from "react";

import {
  HardDrive,
  Cpu,
  MemoryStick,
  Monitor,
  RefreshCw,
} from "lucide-react";

import {
  fsApi,
  gb,
} from "../lib/fsApi";

export default function ComputerApp() {

  const [system, setSystem] =
    useState(null);

  const [drives, setDrives] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
    --------------------------------------------------
    SYSTEM INFORMATION
    --------------------------------------------------
  */

  const loadSystem = async () => {
    try {

      const data =
        await fsApi.system();

      setSystem(data);

    } catch (err) {

      console.error(
        "System API error:",
        err
      );

      setError(
        err?.message ||
        "Unable to read system information"
      );

    }
  };

  /*
    --------------------------------------------------
    DRIVES
    --------------------------------------------------
  */

  const loadDrives = async () => {
    try {

      const data =
        await fsApi.drives();

      setDrives(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "Drive API error:",
        err
      );

      setError(
        err?.message ||
        "Unable to read drives"
      );

    }
  };

  /*
    --------------------------------------------------
    REFRESH
    --------------------------------------------------
  */

  const refresh = async () => {

    setError("");

    setLoading(true);

    await Promise.all([
      loadSystem(),
      loadDrives(),
    ]);

    setLoading(false);
  };

  /*
    --------------------------------------------------
    INITIAL LOAD + REAL-TIME
    --------------------------------------------------
  */

  useEffect(() => {

    refresh();

    const timer =
      setInterval(
        refresh,
        5000
      );

    return () => {
      clearInterval(timer);
    };

  }, []);

  /*
    --------------------------------------------------
    RAM CALCULATION
    --------------------------------------------------
  */

  const ramUsed =
    system
      ? system.totalMem -
        system.freeMem
      : 0;

  const ramPercent =
    system &&
    system.totalMem > 0
      ? (ramUsed /
          system.totalMem) *
        100
      : 0;

  /*
    --------------------------------------------------
    UI
    --------------------------------------------------
  */

  return (
    <div className="computer">

      {/* HEADER */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          gap: "12px",
        }}
      >

        <h2>
          This PC
        </h2>

        <button
          className="tool-btn"
          onClick={refresh}
          title="Refresh"
        >
          <RefreshCw
            size={17}
          />
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <p
          style={{
            color: "#ff7b7b",
          }}
        >
          {error}
        </p>
      )}

      {/* SYSTEM CARDS */}

      <div className="sys-grid">

        {/* CPU */}

        <div className="sys-card">

          <Cpu
            size={30}
            color="#00F5D4"
          />

          <h3>
            CPU
          </h3>

          <p>
            {system?.cpu ||
              "Loading..."}
          </p>

          {system && (
            <small>
              {system.cores}
              {" "}
              logical cores
            </small>
          )}

        </div>

        {/* RAM */}

        <div className="sys-card">

          <MemoryStick
            size={30}
            color="#00F5D4"
          />

          <h3>
            RAM
          </h3>

          <p>
            {system
              ? `${gb(
                  ramUsed
                )} GB / ${gb(
                  system.totalMem
                )} GB`
              : "Loading..."}
          </p>

          {system && (
            <small>
              {ramPercent.toFixed(
                0
              )}
              % used
            </small>
          )}

        </div>

        {/* OS */}

        <div className="sys-card">

          <Monitor
            size={30}
            color="#00F5D4"
          />

          <h3>
            OS
          </h3>

          <p>
            {system?.hostOS ||
              "Loading..."}
          </p>

          {system && (
            <small>
              {system.platform}
              {" • "}
              {system.hostname}
            </small>
          )}

        </div>

      </div>

      {/* DRIVES */}

      <h3 className="drive-title">
        Devices & Drives
      </h3>

      {loading &&
        drives.length === 0 && (
          <p>
            Reading drives...
          </p>
        )}

      {!loading &&
        drives.length === 0 && (
          <p>
            No drives detected.
          </p>
        )}

      {/* REAL DRIVES */}

      {drives.map(
        (drive) => {

          const percent =
            drive.total > 0
              ? Math.min(
                  100,
                  (drive.used /
                    drive.total) *
                    100
                )
              : 0;

          return (
            <div
              className="drive"
              key={drive.mount}
            >

              <div className="drive-head">

                <HardDrive
                  size={22}
                  color="#7C3AED"
                />

                <span>
                  {drive.label ||
                    drive.mount}
                </span>

              </div>

              <div className="drive-bar">

                <div
                  className="drive-fill"
                  style={{
                    width:
                      `${percent}%`,
                  }}
                />

              </div>

              <p>
                {gb(
                  drive.used
                )}
                {" "}
                GB of{" "}
                {gb(
                  drive.total
                )}
                {" "}
                GB used
              </p>

            </div>
          );
        }
      )}

    </div>
  );
}