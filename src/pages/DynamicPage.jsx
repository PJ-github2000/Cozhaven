import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { cmsApi } from '../services/cmsApi.js';
import { motion } from 'framer-motion';

export default function DynamicPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      try {
        setLoading(true);
        const data = await cmsApi.getPublicPage(slug);
        setPage(data);
      } catch (err) {
        console.error("Failed to load CMS page:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPage();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="processing-spinner" />
      </div>
    );
  }

  if (!page) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className={`dynamic-page page-template-${page.template}`}>
      <Helmet>
        <title>{page.seo?.meta_title || `${page.title} | Cozhaven`}</title>
        <meta name="description" content={page.seo?.meta_description || "Premium minimalist furniture design."} />
        {page.seo?.canonical_url && <link rel="canonical" href={page.seo.canonical_url} />}
      </Helmet>

      {/* Hero Section (Standardized if template is default) */}
      <section className="section-padding" style={{ background: 'var(--stone-light)' }}>
        <div className="container">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 'var(--font-size-hero)', fontWeight: 300, marginBottom: 'var(--spacing-md)' }}
          >
            {page.title}
          </motion.h1>
        </div>
      </section>

      {/* Page Content / Sections Framework */}
      <div className="container section-padding">
        {page.sections && page.sections.length > 0 ? (
          page.sections.map((section, idx) => (
             <div key={section.id || idx} className={`cms-section section-type-${section.section_type}`}>
                {/* 
                   In Phase 3 V1, we render basic content. 
                   Real implementation would have a registry of section components.
                */}
                <pre>{JSON.stringify(JSON.parse(section.config_json), null, 2)}</pre>
             </div>
          ))
        ) : (
          <article className="prose prose-lg mx-auto" style={{ maxWidth: '800px', fontSize: '1.125rem', lineHeight: 1.8 }}>
             {/* Placeholder for freeform description if no sections */}
             <p>This page is currently being updated with structured sections.</p>
          </article>
        )}
      </div>
    </div>
  );
}
