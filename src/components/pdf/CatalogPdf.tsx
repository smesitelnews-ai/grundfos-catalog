import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image, Link } from '@react-pdf/renderer';

// Register fonts for Cyrillic support
Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf' },
    { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' }
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Roboto',
    backgroundColor: '#ffffff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: '2px solid #fc8b14',
    paddingBottom: 15,
    marginBottom: 20
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b'
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 5
  },
  contactBox: {
    alignItems: 'flex-end',
    fontSize: 10,
    color: '#334155'
  },
  contactItem: {
    marginBottom: 3
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#0f172a',
    textAlign: 'center'
  },
  productCard: {
    flexDirection: 'row',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#f8fafc',
    breakInside: 'avoid'
  },
  productImage: {
    width: 120,
    height: 120,
    objectFit: 'contain',
    marginRight: 15
  },
  productInfo: {
    flex: 1
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 5
  },
  productArticle: {
    fontSize: 10,
    color: '#fc8b14',
    marginBottom: 10,
    fontWeight: 'bold'
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 10
  },
  specRow: {
    flexDirection: 'row',
    marginBottom: 3
  },
  specKey: {
    fontSize: 9,
    color: '#64748b',
    width: 120
  },
  specValue: {
    fontSize: 9,
    color: '#334155',
    flex: 1
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#94a3b8',
    borderTop: '1px solid #e2e8f0',
    paddingTop: 10
  }
});

interface CatalogPdfProps {
  products: any[];
  isSingle?: boolean;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU').format(price) + ' руб.';
};

export const CatalogPdf = ({ products, isSingle = false }: CatalogPdfProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>GRUNDFOS Каталог</Text>
          <Text style={styles.headerSubtitle}>Официальные поставки оборудования</Text>
        </View>
        <View style={styles.contactBox}>
          <Text style={styles.contactItem}>Телефон: 8 777 41 41 41</Text>
          <Text style={styles.contactItem}>Email: taqtun.ru@yandex.ru</Text>
          <Text style={styles.contactItem}>Адрес: г. Москва, 41км МКАД ряд Б, 2/1</Text>
        </View>
      </View>

      <Text style={styles.title}>
        {isSingle ? 'Коммерческое предложение' : 'Прайс-лист оборудования'}
      </Text>

      {products.map((product, index) => (
        <View key={index} style={styles.productCard}>
          {/* We must use absolute URLs or correct local paths. React-PDF in browser fetches via HTTP. */}
          <Image 
            src={window.location.origin + `/images/pumps/${product.article}.jpg`} 
            style={styles.productImage} 
          />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productArticle}>АРТИКУЛ: {product.article}</Text>
            
            {product.specs && Object.entries(product.specs).slice(0, 6).map(([key, value]) => (
              <View key={key} style={styles.specRow}>
                <Text style={styles.specKey}>{key}:</Text>
                <Text style={styles.specValue}>{value as string}</Text>
              </View>
            ))}
            
            <Text style={styles.productPrice}>{formatPrice(product.our_price)}</Text>
          </View>
        </View>
      ))}

      <Text style={styles.footer} fixed>
        Данное предложение не является публичной офертой. Цены и наличие могут быть изменены.
      </Text>
    </Page>
  </Document>
);
