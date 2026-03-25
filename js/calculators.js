/* ============================================================
   DicoFlow — Cloud Cost Calculators + ROI Engine
   Azure, AWS, GCP pricing with profit margin
   All prices in INR
   ============================================================ */

(function () {
  'use strict';

  // ===== INR FORMATTING =====
  function formatINR(n) {
    if (n === 0) return '₹0';
    if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
    if (n >= 100000) return '₹' + (n / 100000).toFixed(2) + ' L';
    return '₹' + Math.round(n).toLocaleString('en-IN');
  }

  function formatINRShort(n) {
    if (n >= 10000000) return '₹' + (n / 10000000).toFixed(1) + 'Cr';
    if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
    if (n >= 1000) return '₹' + (n / 1000).toFixed(1) + 'K';
    return '₹' + Math.round(n);
  }

  // ===== CONSTANTS =====
  const PROFIT_MARGIN = 0.25; // 25% markup on infrastructure management

  // DicoFlow tier data
  const TIERS = {
    t1: { name: 'T1 Billing', licence: 75000, impl: 10000, amc: 15000, hasImaging: false, avgStudyMB: 0 },
    t2: { name: 'T2 PACS', licence: 150000, impl: 25000, amc: 30000, hasImaging: true, avgStudyMB: 150 },
    t3: { name: 'T3 Radiology', licence: 350000, impl: 50000, amc: 60000, hasImaging: true, avgStudyMB: 150 },
    t4: { name: 'T4 Enterprise', licence: 750000, impl: 100000, amc: 125000, hasImaging: true, avgStudyMB: 150 },
    t5: { name: 'T5 Billing+PACS', licence: 225000, impl: 35000, amc: 40000, hasImaging: true, avgStudyMB: 150 },
  };

  // ===== CLOUD PRICING (per month, in INR, March 2026 estimates) =====

  // Azure Central India
  const AZURE = {
    compute: {
      B2s:   { vcpu: 2, ram: 4,  price: 2800,  label: 'B2s (2 vCPU, 4GB)' },
      D2sv5: { vcpu: 2, ram: 8,  price: 5600,  label: 'D2s v5 (2 vCPU, 8GB)' },
      D4sv5: { vcpu: 4, ram: 16, price: 11200, label: 'D4s v5 (4 vCPU, 16GB)' },
      D8sv5: { vcpu: 8, ram: 32, price: 22400, label: 'D8s v5 (8 vCPU, 32GB)' },
    },
    database: {
      B1ms:  { price: 2100,  storage_per_gb: 10,  label: 'Burstable B1ms (32GB)' },
      D2ds:  { price: 8400,  storage_per_gb: 10,  label: 'GP D2ds (2vCPU, 8GB)' },
      D4ds:  { price: 16800, storage_per_gb: 10,  label: 'GP D4ds (4vCPU, 16GB)' },
      D8ds:  { price: 42000, storage_per_gb: 10,  label: 'GP D8ds (8vCPU, 32GB)' },
    },
    storage: {
      hot_per_gb: 3.0,
      cool_per_gb: 0.84,
      archive_per_gb: 0.17,
    },
    backup_geo_pct: 0.15, // 15% of DB cost for geo-redundant backup
    reserved_discount: 0.26,
  };

  // AWS Mumbai
  const AWS = {
    compute: {
      t3small:    { vcpu: 2, ram: 2,  price: 1700,  label: 't3.small (2 vCPU, 2GB)' },
      m6ilarge:   { vcpu: 2, ram: 8,  price: 6300,  label: 'm6i.large (2 vCPU, 8GB)' },
      m6ixlarge:  { vcpu: 4, ram: 16, price: 12600, label: 'm6i.xlarge (4 vCPU, 16GB)' },
      m6i2xlarge: { vcpu: 8, ram: 32, price: 25200, label: 'm6i.2xlarge (8 vCPU, 32GB)' },
    },
    database: {
      t3micro:   { price: 1400,  storage_per_gb: 10, label: 'db.t3.micro (2 vCPU, 1GB)' },
      m6ilarge:  { price: 9500,  storage_per_gb: 10, label: 'db.m6i.large (2 vCPU, 8GB)' },
      m6ixlarge: { price: 19000, storage_per_gb: 10, label: 'db.m6i.xlarge (4 vCPU, 16GB)' },
      m6i2xlarge:{ price: 42000, storage_per_gb: 10, label: 'db.m6i.2xlarge (8 vCPU, 32GB)' },
    },
    storage: {
      standard_per_gb: 3.2,
      glacier_instant_per_gb: 0.42,
      glacier_deep_per_gb: 0.08,
    },
    multiaz_multiplier: 2.0, // Multi-AZ doubles RDS cost
    savings_discount: 0.29,
  };

  // GCP Mumbai
  const GCP = {
    compute: {
      e2small:     { vcpu: 2, ram: 2,  price: 1500,  label: 'e2-small (2 vCPU, 2GB)' },
      e2standard2: { vcpu: 2, ram: 8,  price: 5200,  label: 'e2-standard-2 (2 vCPU, 8GB)' },
      e2standard4: { vcpu: 4, ram: 16, price: 10400, label: 'e2-standard-4 (4 vCPU, 16GB)' },
      e2standard8: { vcpu: 8, ram: 32, price: 20800, label: 'e2-standard-8 (8 vCPU, 32GB)' },
    },
    database: {
      f1micro:  { price: 1200,  storage_per_gb: 10, label: 'db-f1-micro (shared)' },
      custom2:  { price: 8000,  storage_per_gb: 10, label: 'db-custom-2-8192 (2 vCPU, 8GB)' },
      custom4:  { price: 16000, storage_per_gb: 10, label: 'db-custom-4-16384 (4 vCPU, 16GB)' },
      custom8:  { price: 38000, storage_per_gb: 10, label: 'db-custom-8-32768 (8 vCPU, 32GB)' },
    },
    storage: {
      standard_per_gb: 2.8,
      nearline_per_gb: 0.7,
      coldline_per_gb: 0.14,
    },
    ha_multiplier: 1.0, // HA included in Cloud SQL pricing
    cud_discount: 0.30,
  };

  // ===== CLOUD COST CALCULATOR =====
  function calculateCloudCost(provider, options) {
    const { computeTier, dbTier, dbSizeGB, studiesPerDay, retentionMonths, hasBackupDB, hasArchive } = options;
    const p = provider === 'azure' ? AZURE : provider === 'aws' ? AWS : GCP;
    const compute = p.compute[computeTier];
    const db = p.database[dbTier];

    if (!compute || !db) return null;

    // Storage calculation
    const avgStudyMB = 150;
    const dailyStorageGB = (studiesPerDay * avgStudyMB) / 1024;
    const monthlyGrowthGB = dailyStorageGB * 30;
    const currentHotGB = monthlyGrowthGB * Math.min(retentionMonths, 3); // 3 months hot
    const archiveGB = hasArchive ? monthlyGrowthGB * Math.max(retentionMonths - 3, 0) : 0;

    let computeCost = compute.price;
    let dbCost = db.price + (dbSizeGB * db.storage_per_gb);
    let backupCost = 0;
    let hotStorageCost = 0;
    let archiveCost = 0;

    if (provider === 'azure') {
      hotStorageCost = currentHotGB * p.storage.hot_per_gb;
      archiveCost = archiveGB * p.storage.archive_per_gb;
      backupCost = hasBackupDB ? dbCost * p.backup_geo_pct : 0;
    } else if (provider === 'aws') {
      hotStorageCost = currentHotGB * p.storage.standard_per_gb;
      archiveCost = archiveGB * p.storage.glacier_deep_per_gb;
      backupCost = hasBackupDB ? dbCost : 0; // Multi-AZ = same cost
    } else {
      hotStorageCost = currentHotGB * p.storage.standard_per_gb;
      archiveCost = archiveGB * p.storage.coldline_per_gb;
      backupCost = hasBackupDB ? dbCost * 0.5 : 0; // HA replica ~50% extra
    }

    const subtotal = computeCost + dbCost + backupCost + hotStorageCost + archiveCost;
    const dicoflowFee = subtotal * PROFIT_MARGIN;
    const total = subtotal + dicoflowFee;

    const discount = provider === 'azure' ? p.reserved_discount : provider === 'aws' ? p.savings_discount : p.cud_discount;
    const reservedTotal = total * (1 - discount);

    return {
      compute: computeCost,
      database: dbCost,
      backup: backupCost,
      hotStorage: hotStorageCost,
      archive: archiveCost,
      subtotal,
      dicoflowFee,
      total,
      reservedTotal,
      discount: Math.round(discount * 100),
      monthlyGrowthGB: Math.round(monthlyGrowthGB),
      provider: provider.toUpperCase(),
    };
  }

  // ===== ROI CALCULATOR =====
  function calculateROI(options) {
    const { tier, studiesPerDay, filmCostPerStudy, staffSaved, staffSalary, currentBillingSW, currentPACSSW } = options;
    const t = TIERS[tier];
    if (!t) return null;

    const year1Cost = t.licence + t.impl + t.amc;
    const year2Cost = t.amc;
    const year3Cost = t.amc;
    const threeYearTCO = year1Cost + year2Cost + year3Cost;

    // Savings
    const workingDays = 300;
    const filmSaving = t.hasImaging ? studiesPerDay * filmCostPerStudy * workingDays : 0;
    const staffSaving = staffSaved * staffSalary * 12;
    const complianceSaving = 500000; // PCPNDT penalty avoided annually
    const existingSWCost = (currentBillingSW + currentPACSSW) * 12;

    const totalAnnualBenefit = filmSaving + staffSaving + complianceSaving + existingSWCost;
    const paybackDays = totalAnnualBenefit > 0 ? Math.ceil((year1Cost / totalAnnualBenefit) * 365) : 999;
    const threeYearSaving = (totalAnnualBenefit * 3) - threeYearTCO;

    // Competitor comparison
    const competitorMultiplier = { t1: 2.5, t2: 2.0, t3: 1.6, t4: 1.3, t5: 1.8 };
    const competitorYear1 = year1Cost * (competitorMultiplier[tier] || 1.5);
    const competitorSaving = competitorYear1 - year1Cost;

    return {
      tierName: t.name,
      year1Cost,
      year2Cost,
      year3Cost,
      threeYearTCO,
      filmSaving,
      staffSaving,
      complianceSaving,
      existingSWCost,
      totalAnnualBenefit,
      paybackDays,
      paybackLabel: paybackDays <= 30 ? paybackDays + ' days' : paybackDays <= 365 ? Math.round(paybackDays / 30) + ' months' : '12+ months',
      threeYearSaving: Math.max(0, threeYearSaving),
      competitorYear1,
      competitorSaving,
      roiPercent: totalAnnualBenefit > 0 ? Math.round(((totalAnnualBenefit - year1Cost) / year1Cost) * 100) : 0,
    };
  }

  // ===== NAS COST ESTIMATOR =====
  function calculateNAS(options) {
    const { tier, studiesPerDay } = options;
    const nasConfigs = {
      t1: { hardware: 50000, annualMaint: 11000, label: 'Desktop PC + USB backup' },
      t2: { hardware: 298000, annualMaint: 48000, label: 'Synology DS1621+ RAID-5 (24TB) + Server' },
      t3: { hardware: 848000, annualMaint: 92000, label: 'Synology DS1821+ RAID-6 (64TB) + Archive + Server' },
      t4: { hardware: 730000, annualMaint: 98000, label: 'Per branch: NAS + Server + UPS + 10GbE', perBranch: true },
      t5: { hardware: 298000, annualMaint: 48000, label: 'Synology DS1621+ RAID-5 (24TB) + Server' },
    };
    const config = nasConfigs[tier];
    if (!config) return null;

    const dailyGB = (studiesPerDay * 150) / 1024;
    const yearlyTB = (dailyGB * 300) / 1024;

    return {
      hardware: config.hardware,
      annualMaint: config.annualMaint,
      threeYearTCO: config.hardware + (config.annualMaint * 3),
      label: config.label,
      perBranch: config.perBranch || false,
      yearlyStorageTB: yearlyTB.toFixed(1),
    };
  }

  // ===== SIMPLE CLOUD COST (for infrastructure.html) =====
  function calculateCloudCostSimple(provider, options) {
    const { studies, avgSizeMB, retentionMonths, users, totalStorageGB, monthlyDataGB } = options;
    const p = provider === 'azure' ? AZURE : provider === 'aws' ? AWS : GCP;

    // Pick compute tier based on users
    const computeKeys = Object.keys(p.compute);
    const tier = users <= 3 ? computeKeys[0] : users <= 10 ? computeKeys[1] : users <= 30 ? computeKeys[2] : computeKeys[3];
    const compute = p.compute[tier];

    // Pick DB tier based on studies
    const dbKeys = Object.keys(p.database);
    const dbTier = studies <= 300 ? dbKeys[0] : studies <= 1000 ? dbKeys[1] : studies <= 3000 ? dbKeys[2] : dbKeys[3];
    const db = p.database[dbTier];

    const dbSizeGB = 10;
    const computeCost = compute.price;
    const dbCost = db.price + (dbSizeGB * db.storage_per_gb);

    // Storage: first 3 months hot, rest archive
    const hotGB = Math.min(totalStorageGB, monthlyDataGB * 3);
    const archiveGB = Math.max(0, totalStorageGB - hotGB);
    let storageCost, archiveCost, backupCost;

    if (provider === 'azure') {
      storageCost = hotGB * p.storage.hot_per_gb;
      archiveCost = archiveGB * p.storage.archive_per_gb;
      backupCost = dbCost * p.backup_geo_pct;
    } else if (provider === 'aws') {
      storageCost = hotGB * p.storage.standard_per_gb;
      archiveCost = archiveGB * p.storage.glacier_deep_per_gb;
      backupCost = dbCost * 0.1;
    } else {
      storageCost = hotGB * p.storage.standard_per_gb;
      archiveCost = archiveGB * p.storage.coldline_per_gb;
      backupCost = dbCost * 0.1;
    }

    const sub = computeCost + dbCost + storageCost + archiveCost + backupCost;
    const totalMonthly = Math.round(sub * (1 + PROFIT_MARGIN));
    const discount = provider === 'azure' ? p.reserved_discount : provider === 'aws' ? p.savings_discount : p.cud_discount;

    return {
      compute: Math.round(computeCost),
      database: Math.round(dbCost),
      storage: Math.round(storageCost),
      archive: Math.round(archiveCost),
      backup: Math.round(backupCost),
      totalMonthly,
      reservedDiscount: discount,
    };
  }

  // ===== SIMPLE NAS COST (for infrastructure.html) =====
  function calculateNASSimple(options) {
    const { totalStorageGB } = options;
    const totalTB = totalStorageGB / 1024;
    let hardware, annualMaintenance;
    if (totalTB <= 2)       { hardware = 45000;  annualMaintenance = 8000; }
    else if (totalTB <= 8)  { hardware = 120000; annualMaintenance = 18000; }
    else if (totalTB <= 24) { hardware = 250000; annualMaintenance = 35000; }
    else if (totalTB <= 64) { hardware = 450000; annualMaintenance = 55000; }
    else                    { hardware = 700000; annualMaintenance = 80000; }

    return {
      hardware,
      annualMaintenance,
      threeYearTCO: hardware + (annualMaintenance * 3) + (750 * 36), // incl electricity
    };
  }

  // ===== EXPOSE =====
  const exports = {
    formatINR,
    formatINRShort,
    TIERS,
    AZURE,
    AWS,
    GCP,
    PROFIT_MARGIN,
    calculateCloudCost,
    calculateROI,
    calculateNAS,
    calculateCloudCostSimple,
    calculateNASSimple,
  };

  window.DicoFlowCalc = exports;

  // Alias for pages that use DicoFlowCalculators
  window.DicoFlowCalculators = {
    formatINR,
    TIERS: {
      T1_BILLING:     { licence: 75000,  impl: 10000, amc: 15000 },
      T2_PACS:        { licence: 150000, impl: 25000, amc: 30000 },
      T3_RADIOLOGY:   { licence: 350000, impl: 50000, amc: 60000 },
      T4_ENTERPRISE:  { licence: 750000, impl: 100000, amc: 125000 },
      T5_BILLING_PACS:{ licence: 225000, impl: 35000, amc: 40000 },
    },
    calculateCloudCost: calculateCloudCostSimple,
    calculateNAS: calculateNASSimple,
  };
})();
