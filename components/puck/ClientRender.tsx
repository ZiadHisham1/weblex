'use client';

import { Render, type Data } from '@puckeditor/core';
import { useEffect, useState } from 'react';
import { buildConfig, type BuildConfigCtx } from '@/puck.config';

export function ClientRender({
  data,
  configCtx,
}: {
  data: Data;
  configCtx: BuildConfigCtx;
}) {
  // We use state to hold the config to ensure it only builds on the client
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    // Build the config inside the browser, safe from the server/client boundary
    setConfig(buildConfig(configCtx));
  }, [configCtx]);

  if (!config) return null; // Or a loading skeleton

  return <Render config={config} data={data} />;
}