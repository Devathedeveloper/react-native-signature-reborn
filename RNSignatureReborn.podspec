require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'RNSignatureReborn'
  s.version      = package['version']
  s.summary      = package['description']
  s.description  = <<-DESC
                   A production-ready signature capture component for React Native apps.
                   DESC
  s.homepage     = 'https://github.com/your-org/react-native-signature-reborn'
  s.license      = package['license']
  s.authors      = package['author'] || 'React Native Community'
  s.platforms    = { :ios => '11.0' }
  s.source       = { :git => 'https://github.com/your-org/react-native-signature-reborn.git', :tag => s.version }
  s.source_files = 'ios/**/*.{h,m,mm,swift}'
  s.requires_arc = true
  s.swift_version = '5.0'
  s.dependency 'React-Core'
end
